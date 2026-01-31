import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import { db } from "~/server/db";
import { env } from "~/env";

// Helper to update all references from one userId to another within a transaction
async function updateUserId(tx: any, fromUserId: string, toUserId: string) {
  if (fromUserId === toUserId) return;
  await tx.post.updateMany({ where: { createdById: fromUserId }, data: { createdById: toUserId } });
  await tx.userSkill.updateMany({ where: { userId: fromUserId }, data: { userId: toUserId } });
  await tx.discordMember.updateMany({ where: { userId: fromUserId }, data: { userId: toUserId } });
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    password?: string | null;
    role?: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    Discord({
      clientId: env.AUTH_DISCORD_ID!,
      clientSecret: env.AUTH_DISCORD_SECRET!,
    }),
    GitHub({
      clientId: env.AUTH_GITHUB_ID!,
      clientSecret: env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: env.AUTH_GOOGLE_ID!,
      clientSecret: env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          // Normalize email to avoid case/whitespace mismatches
          const email = parsedCredentials.data.email.trim().toLowerCase();
          const { password } = parsedCredentials.data;
          
          try {
            const user = await db.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
                password: true,
              }
            });

            if (!user) {
              return null;
            }

            // For OAuth users, password might be null
            if (!user.password) return null;

            const passwordsMatch = await compare(password, user.password);

            if (passwordsMatch) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
              };
            }
          } catch (error) {
            console.error("Error during authentication:", error);
            return null;
          }
        }

        return null;
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  // Temporarily use JWT sessions to isolate DB-session issues in E2E
  session: { strategy: 'jwt' },
  events: {
    // When an OAuth account is linked, ensure Discord members are associated to this user
    async linkAccount({ user, account }: any) {
      try {
        if (!account || account.provider !== 'discord') return;
        const discordId = account.providerAccountId as string;

        // Find all DiscordMember records for this Discord user across guilds
        const members = await db.discordMember.findMany({ where: { discordId } });
        if (members.length === 0) return;

        // If there are placeholder users previously linked, merge them into the authenticated user
        const previousUserIds = Array.from(new Set(members.map((m) => m.userId).filter(Boolean))) as string[];

        await db.$transaction(async (tx) => {
          for (const prevUserId of previousUserIds) {
            if (prevUserId === user.id) continue;

            // Re-point related data to the real user
            await updateUserId(tx, prevUserId, user.id);

            // Best-effort cleanup of placeholder user
            try {
              await tx.user.delete({ where: { id: prevUserId } });
            } catch {
              // Ignore if user cannot be deleted due to constraints
            }
          }

          // Ensure current Discord members are linked to this user
          await tx.discordMember.updateMany({ where: { discordId }, data: { userId: user.id } });
        });
      } catch (e) {
        console.error('Failed to auto-link Discord member on account link:', e);
      }
    },
  },
  callbacks: {
    // Support both database and jwt session strategies
    jwt: async ({ token, user, trigger }: any) => {
      // On sign in, persist basic user info into the token
      if (user) {
        token.sub = user.id ?? token.sub;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        if (user.image) token.picture = user.image;
      }
      // ユーザーのロールをトークンに含める（サインイン時またはロールが未設定の場合）
      if ((user || !token.role) && token.sub) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.sub },
            select: { role: true },
          });
          token.role = dbUser?.role ?? 'MEMBER';
        } catch (error) {
          console.error('Failed to fetch user role:', error);
          token.role = token.role ?? 'MEMBER';
        }
      }
      return token;
    },
    session: ({ session, user, token }: any) => {
      const baseUser = session.user || {};
      return {
        ...session,
        user: {
          ...baseUser,
          id: user?.id ?? token?.sub ?? (session.user?.id as string | undefined),
          name: (session.user?.name as string | undefined) ?? (token?.name as string | undefined),
          email: (session.user?.email as string | undefined) ?? (token?.email as string | undefined),
          image: (session.user?.image as string | undefined) ?? (token?.picture as string | undefined),
          role: token?.role ?? 'MEMBER',
        },
      };
    },
  },
} satisfies NextAuthConfig;
