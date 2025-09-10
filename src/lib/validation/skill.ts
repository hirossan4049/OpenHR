import { z } from "zod";

// 共通フィールド定義
export const levelSchema = z.number().min(1).max(5);
export const yearsOfExpSchema = z.number().min(0).max(50).optional();

// 作成用スキーマ
export const skillCreateSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  level: levelSchema,
  yearsOfExp: yearsOfExpSchema,
});

// 更新用スキーマ（name は更新対象外）
export const skillUpdateSchema = z.object({
  level: levelSchema,
  yearsOfExp: yearsOfExpSchema,
});

export type SkillCreateInput = z.infer<typeof skillCreateSchema>;
export type SkillUpdateInput = z.infer<typeof skillUpdateSchema>;
