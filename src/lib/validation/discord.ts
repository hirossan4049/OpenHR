import { z } from "zod";

// Discord Guild ID validation
export const discordGuildIdSchema = z.string()
  .regex(/^\d{17,19}$/, "Invalid Discord Guild ID format");

// Discord User ID validation  
export const discordUserIdSchema = z.string()
  .regex(/^\d{17,19}$/, "Invalid Discord User ID format");

// Discord member sync request
export const discordMemberSyncSchema = z.object({
  guildId: discordGuildIdSchema,
});

// Discord member search and pagination
export const discordMemberSearchSchema = z.object({
  guildId: discordGuildIdSchema,
  search: z.string().min(1).max(100).optional(),
  skip: z.number().min(0).default(0),
  take: z.number().min(1).max(100).default(50),
});

// Discord member linking
export const discordMemberLinkSchema = z.object({
  discordMemberId: z.string().cuid(),
  userId: z.string().cuid(),
});

// Discord member unlinking
export const discordMemberUnlinkSchema = z.object({
  discordMemberId: z.string().cuid(),
});

// Guild sync status filter
export const guildSyncStatusSchema = z.enum([
  "pending",
  "syncing", 
  "completed",
  "error"
]);

// Discord member status filter
export const discordMemberStatusSchema = z.enum([
  "active",
  "left", 
  "error"
]);