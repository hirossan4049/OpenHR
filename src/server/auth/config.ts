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
  callbacks: {
    // Support both database and jwt session strategies
    jwt: ({ token, user }: any) => {
      // On sign in, persist basic user info into the token
      if (user) {
        token.sub = user.id ?? token.sub;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        if (user.image) token.picture = user.image;
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
        },
      };
    },
  },
} satisfies NextAuthConfig;
