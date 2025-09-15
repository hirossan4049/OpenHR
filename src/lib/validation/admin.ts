import { z } from "zod";

// User role enum
export const userRoleSchema = z.enum(["ADMIN", "MEMBER", "VIEWER"]);

// Create viewer account schema
export const createViewerAccountSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

// Update user role schema
export const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: userRoleSchema,
});

// Tag validation schemas
export const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid HEX format (e.g., #FF5733)");

export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: hexColorSchema,
  description: z.string().max(200).optional(),
});

export const updateTagSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  color: hexColorSchema,
  description: z.string().max(200).optional(),
});

export const deleteTagSchema = z.object({
  id: z.string(),
});

export const assignTagToUserSchema = z.object({
  userId: z.string(),
  tagId: z.string(),
});

export const removeTagFromUserSchema = z.object({
  userId: z.string(),
  tagId: z.string(),
});

// Type exports
export type UserRole = z.infer<typeof userRoleSchema>;
export type CreateViewerAccountInput = z.infer<typeof createViewerAccountSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type DeleteTagInput = z.infer<typeof deleteTagSchema>;
export type AssignTagToUserInput = z.infer<typeof assignTagToUserSchema>;
export type RemoveTagFromUserInput = z.infer<typeof removeTagFromUserSchema>;