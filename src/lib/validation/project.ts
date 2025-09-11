import { z } from "zod";

// Project creation schema
export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(2000, "Description must be less than 2000 characters"),
  type: z.enum(["project", "event"]).default("project"),
  maxMembers: z.number().min(1, "Must allow at least 1 member").max(100, "Cannot exceed 100 members").optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  requiredSkills: z.array(z.object({
    skillId: z.string(),
    minLevel: z.number().min(1).max(5).default(1),
    priority: z.enum(["required", "preferred"]).default("required"),
  })).optional(),
}).refine((data) => {
  // If both dates are provided, endDate should be after startDate
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// Project update schema
export const updateProjectSchema = createProjectSchema.partial().merge(
  z.object({ id: z.string() })
);

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