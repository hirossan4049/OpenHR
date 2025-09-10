import { z } from "zod";

// 共通フィールド定義
export const levelSchema = z.number().min(1).max(5);
export const yearsOfExpSchema = z.number().min(0).max(50).optional();

// スキルマスター用のスキーマ
export const skillMasterSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(100),
  slug: z.string().min(1, "Skill slug is required").max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  category: z.string().max(50).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  aliases: z.array(z.string().max(100)).optional(),
  verified: z.boolean().default(false),
});

// スキル作成用スキーマ (ユーザー側)
export const skillCreateSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  level: levelSchema,
  yearsOfExp: yearsOfExpSchema,
});

// スキル更新用スキーマ（name は更新対象外）
export const skillUpdateSchema = z.object({
  level: levelSchema,
  yearsOfExp: yearsOfExpSchema,
});

// スキル検索用スキーマ
export const skillSearchSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().min(1).max(50).default(10),
});

// スキル提案作成用スキーマ
export const skillSuggestionSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(100),
  category: z.string().max(50).optional(),
});

export type SkillMaster = z.infer<typeof skillMasterSchema>;
export type SkillCreateInput = z.infer<typeof skillCreateSchema>;
export type SkillUpdateInput = z.infer<typeof skillUpdateSchema>;
export type SkillSearchInput = z.infer<typeof skillSearchSchema>;
export type SkillSuggestion = z.infer<typeof skillSuggestionSchema>;
