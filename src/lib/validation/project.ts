import { z } from "zod";

// Accept YYYY-MM-DD, YYYY-MM, YYYY-MM-DDTHH:mm, or Date and normalize to Date
const flexibleDate = z.preprocess((value) => {
  if (value == null || value === "") return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const ym = value.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
    const ymd = value.match(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);
    const ymdhm = value.match(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d)$/);
    if (ymd) {
      const y = parseInt(ymd[1]!, 10);
      const m = parseInt(ymd[2]!, 10);
      const d = parseInt(ymd[3]!, 10);
      // Construct with local time to avoid UTC shift
      return new Date(y, m - 1, d);
    }
    if (ym) {
      const y = parseInt(ym[1]!, 10);
      const m = parseInt(ym[2]!, 10);
      return new Date(y, m - 1, 1);
    }
    if (ymdhm) {
      const y = parseInt(ymdhm[1]!, 10);
      const m = parseInt(ymdhm[2]!, 10);
      const d = parseInt(ymdhm[3]!, 10);
      const hh = parseInt(ymdhm[4]!, 10);
      const mm = parseInt(ymdhm[5]!, 10);
      return new Date(y, m - 1, d, hh, mm);
    }
    // Fallback: try native Date parsing
    const t = Date.parse(value);
    if (!Number.isNaN(t)) return new Date(t);
  }
  return value;
}, z.date());

// Base project schema (without refinements)
const baseProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters"),
  type: z.enum(["project", "event"]).default("project"),
  maxMembers: z
    .number()
    .min(1, "Must allow at least 1 member")
    .max(100, "Cannot exceed 100 members")
    .optional(),
  startDate: flexibleDate.optional(),
  endDate: flexibleDate.optional(),
  requiredSkills: z
    .array(
      z.object({
        skillId: z.string(),
        minLevel: z.number().min(1).max(5).default(1),
        priority: z.enum(["required", "preferred"]).default("required"),
      })
    )
    .optional(),
});

// Shared refinement: if both dates are present, endDate must be after startDate
const dateOrderRefinement = (data: { startDate?: Date; endDate?: Date }) => {
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
};

// Project creation schema
export const createProjectSchema = baseProjectSchema.refine(dateOrderRefinement, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// Project update schema (partial of base + id), with same refinement
export const updateProjectSchema = baseProjectSchema
  .partial()
  .merge(z.object({ id: z.string() }))
  .refine(dateOrderRefinement, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

// Project search/filter schema
export const projectSearchSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["project", "event"]).optional(),
  skillId: z.string().optional(),
  organizerId: z.string().optional(),
  recruitmentStatus: z.enum(["open", "closed"]).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Application schema
export const createApplicationSchema = z.object({
  projectId: z.string(),
  message: z.string().max(1000, "Message must be less than 1000 characters").optional(),
});

// Application response schema
export const respondToApplicationSchema = z.object({
  applicationId: z.string(),
  status: z.enum(["approved", "rejected"]),
  response: z.string().max(1000, "Response must be less than 1000 characters").optional(),
});

// Project recruitment status update
export const updateRecruitmentStatusSchema = z.object({
  projectId: z.string(),
  status: z.enum(["open", "closed"]),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectSearchInput = z.infer<typeof projectSearchSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type RespondToApplicationInput = z.infer<typeof respondToApplicationSchema>;
export type UpdateRecruitmentStatusInput = z.infer<typeof updateRecruitmentStatusSchema>;
