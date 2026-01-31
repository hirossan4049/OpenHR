import { randomUUID } from "crypto";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const shouldSkipValidation =
  process.env.SKIP_ENV_VALIDATION === "1" || process.env.SKIP_ENV_VALIDATION === "true";
const appEnv = process.env.APP_ENV ?? "development";
const fallbackAuthSecret = randomUUID();
const fallbackDatabaseUrl = "postgresql://user:password@localhost:5432/openhr";
const fallbackOauthDefaults = {
  discordId: `dev-placeholder-discord-id-${randomUUID()}`,
  discordSecret: `dev-placeholder-discord-secret-${randomUUID()}`,
  githubId: `dev-placeholder-github-id-${randomUUID()}`,
  githubSecret: `dev-placeholder-github-secret-${randomUUID()}`,
  googleId: `dev-placeholder-google-id-${randomUUID()}`,
  googleSecret: `dev-placeholder-google-secret-${randomUUID()}`,
  discordBotToken: `dev-placeholder-discord-bot-token-${randomUUID()}`,
};

process.env.AUTH_SECRET ??= appEnv === "production" ? fallbackAuthSecret : "dev-secret-not-for-prod";
// NextAuth accepts either AUTH_SECRET or NEXTAUTH_SECRET; set both when generating fallbacks.
process.env.NEXTAUTH_SECRET ??= process.env.AUTH_SECRET;
process.env.DATABASE_URL ??= fallbackDatabaseUrl;
process.env.DISCORD_BOT_TOKEN ??= fallbackOauthDefaults.discordBotToken;
process.env.AUTH_DISCORD_ID ??= fallbackOauthDefaults.discordId;
process.env.AUTH_DISCORD_SECRET ??= fallbackOauthDefaults.discordSecret;
process.env.AUTH_GITHUB_ID ??= fallbackOauthDefaults.githubId;
process.env.AUTH_GITHUB_SECRET ??= fallbackOauthDefaults.githubSecret;
process.env.AUTH_GOOGLE_ID ??= fallbackOauthDefaults.googleId;
process.env.AUTH_GOOGLE_SECRET ??= fallbackOauthDefaults.googleSecret;

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET: z.string().default(process.env.AUTH_SECRET),
    AUTH_URL: z.string().url().optional(),
    AUTH_DISCORD_ID: z.string().default(process.env.AUTH_DISCORD_ID),
    AUTH_DISCORD_SECRET: z.string().default(process.env.AUTH_DISCORD_SECRET),
    AUTH_GITHUB_ID: z.string().default(process.env.AUTH_GITHUB_ID),
    AUTH_GITHUB_SECRET: z.string().default(process.env.AUTH_GITHUB_SECRET),
    AUTH_GOOGLE_ID: z.string().default(process.env.AUTH_GOOGLE_ID),
    AUTH_GOOGLE_SECRET: z.string().default(process.env.AUTH_GOOGLE_SECRET),
    DISCORD_BOT_TOKEN: z.string().default(process.env.DISCORD_BOT_TOKEN),
    DATABASE_URL: z
      .string()
      .url()
      .default(fallbackDatabaseUrl),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: shouldSkipValidation,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
