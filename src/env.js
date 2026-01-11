import { randomUUID } from "crypto";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const shouldSkipValidation = process.env.SKIP_ENV_VALIDATION !== "0";
/**
 * @param {import("zod").ZodTypeAny} schema
 * @param {any} defaultValue
 * @returns {import("zod").ZodTypeAny}
 */
const withDefault = (schema, defaultValue) =>
  shouldSkipValidation ? schema.default(defaultValue) : schema;
/**
 * @param {any} value
 * @param {any} defaultValue
 * @returns {any}
 */
const withRuntimeDefault = (value, defaultValue) =>
  shouldSkipValidation ? value ?? defaultValue : value;
const fallbackAuthSecret = randomUUID();
const fallbackDatabaseUrl = "file:./db.sqlite";

if (shouldSkipValidation) {
  process.env.AUTH_SECRET ??= fallbackAuthSecret;
  process.env.NEXTAUTH_SECRET ??= fallbackAuthSecret;
  process.env.DATABASE_URL ??= fallbackDatabaseUrl;
  process.env.DISCORD_BOT_TOKEN ??= "placeholder";
  process.env.AUTH_DISCORD_ID ??= "placeholder";
  process.env.AUTH_DISCORD_SECRET ??= "placeholder";
  process.env.AUTH_GITHUB_ID ??= "placeholder";
  process.env.AUTH_GITHUB_SECRET ??= "placeholder";
  process.env.AUTH_GOOGLE_ID ??= "placeholder";
  process.env.AUTH_GOOGLE_SECRET ??= "placeholder";
}

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET: withDefault(z.string(), fallbackAuthSecret),
    AUTH_URL: z.string().url().optional(),
    AUTH_DISCORD_ID: withDefault(z.string(), "placeholder"),
    AUTH_DISCORD_SECRET: withDefault(z.string(), "placeholder"),
    AUTH_GITHUB_ID: withDefault(z.string(), "placeholder"),
    AUTH_GITHUB_SECRET: withDefault(z.string(), "placeholder"),
    AUTH_GOOGLE_ID: withDefault(z.string(), "placeholder"),
    AUTH_GOOGLE_SECRET: withDefault(z.string(), "placeholder"),
    DISCORD_BOT_TOKEN: withDefault(z.string(), "placeholder"),
    DATABASE_URL: withDefault(z.string(), fallbackDatabaseUrl),
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
    AUTH_SECRET: withRuntimeDefault(process.env.AUTH_SECRET, fallbackAuthSecret),
    AUTH_URL: process.env.AUTH_URL,
    AUTH_DISCORD_ID: withRuntimeDefault(process.env.AUTH_DISCORD_ID, "placeholder"),
    AUTH_DISCORD_SECRET: withRuntimeDefault(process.env.AUTH_DISCORD_SECRET, "placeholder"),
    AUTH_GITHUB_ID: withRuntimeDefault(process.env.AUTH_GITHUB_ID, "placeholder"),
    AUTH_GITHUB_SECRET: withRuntimeDefault(process.env.AUTH_GITHUB_SECRET, "placeholder"),
    AUTH_GOOGLE_ID: withRuntimeDefault(process.env.AUTH_GOOGLE_ID, "placeholder"),
    AUTH_GOOGLE_SECRET: withRuntimeDefault(process.env.AUTH_GOOGLE_SECRET, "placeholder"),
    DISCORD_BOT_TOKEN: withRuntimeDefault(process.env.DISCORD_BOT_TOKEN, "placeholder"),
    DATABASE_URL: withRuntimeDefault(process.env.DATABASE_URL, fallbackDatabaseUrl),
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
