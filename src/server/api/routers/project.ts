import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  createProjectSchema,
  updateProjectSchema,
  projectSearchSchema,
  createApplicationSchema,
  respondToApplicationSchema,
  updateRecruitmentStatusSchema,
  addProjectMemberSchema,
  removeProjectMemberSchema,
  updateProjectMemberRoleSchema,
} from "~/lib/validation/project";

export const projectRouter = createTRPCRouter({
  // Get all projects with optional filtering
  getAll: publicProcedure
    .input(projectSearchSchema)
    .query(async ({ ctx, input }) => {
      const { search, type, skillId, organizerId, recruitmentStatus, limit, offset } = input;

      const where: any = {};

      // Build search conditions
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
        ];
      }

      if (type) {
        where.type = type;
      }

      if (recruitmentStatus) {
        where.recruitmentStatus = recruitmentStatus;
      }

      if (organizerId) {
        where.organizerId = organizerId;
      }

      if (skillId) {
        where.requiredSkills = {
          some: {
            skillId: skillId,
          },
        };
      }

      const [projects, total] = await Promise.all([
        ctx.db.project.findMany({
          where,
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            requiredSkills: {
              include: {
                skill: true,
              },
            },
            members: {
              select: {
                id: true,
              },
            },
            _count: {
              select: {
                applications: true,
                members: true,
              },
            },
          },
          orderBy: [
            { createdAt: "desc" },
          ],
          take: limit,
          skip: offset,
        }),
        ctx.db.project.count({ where }),
      ]);

      return {
        projects: projects.map((project) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          type: project.type,
          recruitmentStatus: project.recruitmentStatus,
          maxMembers: project.maxMembers,
          startDate: project.startDate,
          endDate: project.endDate,
          createdAt: project.createdAt,
          organizer: project.organizer,
          requiredSkills: project.requiredSkills.map((rs) => ({
            skillId: rs.skillId,
            skillName: rs.skill.name,
            minLevel: rs.minLevel,
            priority: rs.priority,
            category: rs.skill.category,
          })),
          memberCount: project._count.members,
          applicationCount: project._count.applications,
        })),
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get project by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              image: true,
              bio: true,
            },
          },
          requiredSkills: {
            include: {
              skill: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  bio: true,
                },
              },
            },
          },
          applications: {
            where: {
              status: "pending",
            },
            select: {
              id: true,
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        type: project.type,
        recruitmentStatus: project.recruitmentStatus,
        maxMembers: project.maxMembers,
        startDate: project.startDate,
        endDate: project.endDate,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        organizer: project.organizer,
        requiredSkills: project.requiredSkills.map((rs) => ({
          skillId: rs.skillId,
          skillName: rs.skill.name,
          minLevel: rs.minLevel,
          priority: rs.priority,
          category: rs.skill.category,
        })),
        members: project.members.map((member) => ({
          id: member.id,
          role: member.role,
          joinedAt: member.joinedAt,
          user: member.user,
        })),
        pendingApplicationsCount: project.applications.length,
      };
    }),

  // Create new project (protected)
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { requiredSkills, ...projectData } = input;

      const project = await ctx.db.project.create({
        data: {
          ...projectData,
          organizerId: ctx.session.user.id,
          requiredSkills: requiredSkills
            ? {
                create: requiredSkills.map((skill) => ({
                  skillId: skill.skillId,
                  minLevel: skill.minLevel,
                  priority: skill.priority,
                })),
              }
            : undefined,
          // Automatically add organizer as a member
          members: {
            create: {
              userId: ctx.session.user.id,
              role: "organizer",
            },
          },
        },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          requiredSkills: {
            include: {
              skill: true,
            },
          },
        },
      });

      return project;
    }),

  // Update project (protected, organizer only)
  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, requiredSkills, ...updateData } = input;

      // Check if user is the organizer
      const existingProject = await ctx.db.project.findUnique({
        where: { id },
        select: { organizerId: true },
      });

      if (!existingProject) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      if (existingProject.organizerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the organizer can update this project" });
      }

      const project = await ctx.db.project.update({
        where: { id },
        data: {
          ...updateData,
          requiredSkills: requiredSkills
            ? {
                deleteMany: {},
                create: requiredSkills.map((skill) => ({
                  skillId: skill.skillId,
                  minLevel: skill.minLevel,
                  priority: skill.priority,
                })),
              }
            : undefined,
        },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          requiredSkills: {
            include: {
              skill: true,
            },
          },
        },
      });

      return project;
    }),

  // Update recruitment status
  updateRecruitmentStatus: protectedProcedure
    .input(updateRecruitmentStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId, status } = input;

      // Check if user is the organizer
      const project = await ctx.db.project.findUnique({
        where: { id: projectId },
        select: { organizerId: true },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      if (project.organizerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the organizer can update recruitment status" });
      }

      return ctx.db.project.update({
        where: { id: projectId },
        data: { recruitmentStatus: status },
      });
    }),

  // Add member directly (organizer only)
  addMember: protectedProcedure
    .input(addProjectMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId, userId, role = "member" } = input;

      // Check organizer permission
      const project = await ctx.db.project.findUnique({
        where: { id: projectId },
        select: {
          organizerId: true,
          maxMembers: true,
          _count: { select: { members: true } },
        },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.organizerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the organizer can add members" });
      }

      // Check member limit
      if (project.maxMembers && project._count.members >= project.maxMembers) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Project has reached maximum members" });
      }

      // Check if user exists
      const user = await ctx.db.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Check existing membership
      const existingMembership = await ctx.db.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
      });
      if (existingMembership) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User is already a member of this project" });
      }

      // Create membership
      const member = await ctx.db.projectMember.create({
        data: { projectId, userId, role },
      });

      return member;
    }),

  // Remove member (organizer only)
  removeMember: protectedProcedure
    .input(removeProjectMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId, userId } = input;

      // Check organizer permission and get organizerId
      const project = await ctx.db.project.findUnique({
        where: { id: projectId },
        select: { organizerId: true },
      });
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.organizerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the organizer can remove members" });
      }

      // Do not allow removing organizer's own membership entry if any
      if (userId === project.organizerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot remove the organizer from the project" });
      }

      // Check membership exists
      const membership = await ctx.db.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
      });
      if (!membership) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Membership not found" });
      }

      await ctx.db.projectMember.delete({
        where: { id: membership.id },
      });

      return { success: true };
    }),

  // Update member role (organizer only)
  updateMemberRole: protectedProcedure
    .input(updateProjectMemberRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId, userId, role } = input;

      const project = await ctx.db.project.findUnique({
        where: { id: projectId },
        select: { organizerId: true },
      });
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.organizerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the organizer can update roles" });
      }
      if (userId === project.organizerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot change organizer role" });
      }

      const membership = await ctx.db.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
      });
      if (!membership) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Membership not found" });
      }

      const updated = await ctx.db.projectMember.update({
        where: { id: membership.id },
        data: { role },
      });

      return updated;
    }),

  // Apply to project
  applyToProject: protectedProcedure
    .input(createApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId, message } = input;

      // Check if project exists and recruitment is open
      const project = await ctx.db.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          recruitmentStatus: true,
          organizerId: true,
          maxMembers: true,
          _count: {
            select: { members: true },
          },
        },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      if (project.recruitmentStatus !== "open") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Project recruitment is closed" });
      }

      if (project.organizerId === ctx.session.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Organizers cannot apply to their own projects" });
      }

      if (project.maxMembers && project._count.members >= project.maxMembers) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Project has reached maximum members" });
      }

      // Check if user already applied or is a member
      const existingApplication = await ctx.db.projectApplication.findUnique({
        where: {
          projectId_applicantId: {
            projectId,
            applicantId: ctx.session.user.id,
          },
        },
      });

      if (existingApplication) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You have already applied to this project" });
      }

      const existingMembership = await ctx.db.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (existingMembership) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You are already a member of this project" });
      }

      return ctx.db.projectApplication.create({
        data: {
          projectId,
          applicantId: ctx.session.user.id,
          message,
        },
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              image: true,
              bio: true,
            },
          },
        },
      });
    }),

  // Get applications for a project (organizer only)
  getApplications: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      status: z.enum(["pending", "approved", "rejected"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { projectId, status } = input;

      // Check if user is the organizer
      const project = await ctx.db.project.findUnique({
        where: { id: projectId },
        select: { organizerId: true },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      if (project.organizerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the organizer can view applications" });
      }

      const applications = await ctx.db.projectApplication.findMany({
        where: {
          projectId,
          ...(status && { status }),
        },
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              image: true,
              bio: true,
              userSkills: {
                include: {
                  skill: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return applications.map((app) => ({
        id: app.id,
        status: app.status,
        message: app.message,
        response: app.response,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        applicant: {
          ...app.applicant,
          skills: app.applicant.userSkills.map((us) => ({
            id: us.skill.id,
            name: us.skill.name,
            level: us.level,
            yearsOfExp: us.yearsOfExp,
            category: us.skill.category,
          })),
        },
      }));
    }),

  // Respond to application (organizer only)
  respondToApplication: protectedProcedure
    .input(respondToApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const { applicationId, status, response } = input;

      // Get application with project info
      const application = await ctx.db.projectApplication.findUnique({
        where: { id: applicationId },
        include: {
          project: {
            select: {
              id: true,
              organizerId: true,
              maxMembers: true,
              _count: {
                select: { members: true },
              },
            },
          },
        },
      });

      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }

      if (application.project.organizerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the organizer can respond to applications" });
      }

      if (application.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Application has already been processed" });
      }

      // If approving, check member limit
      if (status === "approved") {
        const { maxMembers, _count } = application.project;
        if (maxMembers && _count.members >= maxMembers) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Project has reached maximum members" });
        }
      }

      const updatedApplication = await ctx.db.projectApplication.update({
        where: { id: applicationId },
        data: {
          status,
          response,
        },
      });

      // If approved, add user as project member
      if (status === "approved") {
        await ctx.db.projectMember.create({
          data: {
            projectId: application.project.id,
            userId: application.applicantId,
            role: "member",
          },
        });
      }

      return updatedApplication;
    }),

  // Get user's applications
  getMyApplications: protectedProcedure.query(async ({ ctx }) => {
    const applications = await ctx.db.projectApplication.findMany({
      where: { applicantId: ctx.session.user.id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            type: true,
            organizer: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return applications;
  }),

  // Get user's organized projects
  getMyProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: { organizerId: ctx.session.user.id },
      include: {
        _count: {
          select: {
            applications: { where: { status: "pending" } },
            members: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return projects;
  }),
});
