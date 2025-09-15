import { z } from "zod";
import { hash } from "bcryptjs";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { skillMasterSchema } from "~/lib/validation/skill";
import { discordMemberSyncService } from "~/server/services/discord-member-sync";
import { requireAdmin } from "~/lib/auth/roles";
import {
  createViewerAccountSchema,
  updateUserRoleSchema,
  createTagSchema,
  updateTagSchema,
  deleteTagSchema,
  assignTagToUserSchema,
  removeTagFromUserSchema,
} from "~/lib/validation/admin";

export const adminRouter = createTRPCRouter({
  // Get dashboard statistics (admin only)
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    // Get user with role for permission check
    const currentUser = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { id: true, role: true },
    });
    
    if (!currentUser) {
      throw new Error("User not found");
    }
    
    requireAdmin(currentUser);
    
    const [
      totalUsers,
      totalProjects,
      totalEvents,
      totalSkills,
      activeUsers,
      recentApplications,
      pendingApplications,
    ] = await Promise.all([
      // Total user count
      ctx.db.user.count(),
      
      // Total project count
      ctx.db.project.count({
        where: { type: "project" },
      }),
      
      // Total event count
      ctx.db.project.count({
        where: { type: "event" },
      }),
      
      // Total skill count
      ctx.db.skill.count(),
      
      // Active users (users who have logged in within last 30 days)
      ctx.db.user.count({
        where: {
          sessions: {
            some: {
              expires: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          },
        },
      }),
      
      // Recent applications (last 7 days)
      ctx.db.projectApplication.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      
      // Pending applications
      ctx.db.projectApplication.count({
        where: {
          status: "pending",
        },
      }),
    ]);

    return {
      totalUsers,
      totalProjects,
      totalEvents,
      totalSkills,
      activeUsers,
      recentApplications,
      pendingApplications,
    };
  }),

  // Get recent activities (admin only)
  getRecentActivities: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);
      
      const [recentProjects, recentApplications] = await Promise.all([
        // Recent projects/events
        ctx.db.project.findMany({
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                applications: true,
                members: true,
              },
            },
          },
        }),
        
        // Recent applications
        ctx.db.projectApplication.findMany({
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            applicant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            project: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
          },
        }),
      ]);

      return {
        recentProjects,
        recentApplications,
      };
    }),

  // Get all skills with usage statistics (admin only)
  getAllSkillsWithStats: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { id: true, role: true },
    });
    
    if (!currentUser) {
      throw new Error("User not found");
    }
    
    requireAdmin(currentUser);
    
    const skills = await ctx.db.skill.findMany({
      include: {
        _count: {
          select: {
            userSkills: true,
          },
        },
      },
      orderBy: [
        { verified: "desc" },
        { name: "asc" },
      ],
    });

    return skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      category: skill.category,
      logoUrl: skill.logoUrl,
      aliases: skill.aliases ? JSON.parse(skill.aliases) : [],
      verified: skill.verified,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
      _count: skill._count,
    }));
  }),

  // Update skill (admin only)
  updateSkill: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(50)
          .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
        category: z.string().max(50).nullable(),
        logoUrl: z.string().url().nullable().or(z.literal("")),
        aliases: z.array(z.string().max(100)),
        verified: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);
      
      const { id, logoUrl, aliases, ...updateData } = input;
      
      return ctx.db.skill.update({
        where: { id },
        data: {
          ...updateData,
          logoUrl: logoUrl || null,
          aliases: JSON.stringify(aliases),
        },
      });
    }),

  // Delete skill (admin only)
  deleteSkill: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);
      
      // Check if skill is in use
      const skillUsage = await ctx.db.userSkill.count({
        where: { skillId: input.id },
      });
      
      if (skillUsage > 0) {
        throw new Error("Cannot delete skill that is in use by users");
      }
      
      return ctx.db.skill.delete({
        where: { id: input.id },
      });
    }),

  // Merge skills (admin only)
  mergeSkills: protectedProcedure
    .input(
      z.object({
        sourceId: z.string(),
        targetId: z.string(),
        keepTarget: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);
      
      const { sourceId, targetId, keepTarget: _keepTarget } = input;
      
      return ctx.db.$transaction(async (tx) => {
        // Move all user skills from source to target
        await tx.userSkill.updateMany({
          where: { skillId: sourceId },
          data: { skillId: targetId },
        });
        
        // Delete the source skill
        await tx.skill.delete({
          where: { id: sourceId },
        });
        
        return tx.skill.findUnique({
          where: { id: targetId },
        });
      });
    }),

  // Bulk verify skills
  bulkVerifySkills: protectedProcedure
    .input(z.object({ skillIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);
      
      return ctx.db.skill.updateMany({
        where: { id: { in: input.skillIds } },
        data: { verified: true },
      });
    }),

  // Import skills from JSON
  importSkills: protectedProcedure
    .input(z.array(skillMasterSchema))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);
      
      const results = [];
      
      for (const skillData of input) {
        try {
          const skill = await ctx.db.skill.upsert({
            where: { slug: skillData.slug },
            update: {
              name: skillData.name,
              category: skillData.category || null,
              logoUrl: skillData.logoUrl || null,
              aliases: JSON.stringify(skillData.aliases || []),
              verified: skillData.verified,
            },
            create: {
              name: skillData.name,
              slug: skillData.slug,
              category: skillData.category || null,
              logoUrl: skillData.logoUrl || null,
              aliases: JSON.stringify(skillData.aliases || []),
              verified: skillData.verified,
            },
          });
          
          results.push({ success: true, skill });
        } catch (error) {
          results.push({ 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error",
            skillData 
          });
        }
      }
      
      return results;
    }),

  // ========== DISCORD MEMBER MANAGEMENT ==========

  // Get all guilds with sync status
  getGuildSyncs: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { id: true, role: true },
    });
    
    if (!currentUser) {
      throw new Error("User not found");
    }
    
    requireAdmin(currentUser);
    
    return ctx.db.guildSync.findMany({
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: { lastSyncedAt: "desc" },
    });
  }),

  // Get guild sync status
  getGuildSyncStatus: protectedProcedure
    .input(z.object({ guildId: z.string() }))
    .query(async ({ input }) => {
      return discordMemberSyncService.getGuildSyncStatus(input.guildId);
    }),

  // Sync Discord guild members
  syncGuildMembers: protectedProcedure
    .input(z.object({ guildId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);
      
      return discordMemberSyncService.syncGuildMembers(input.guildId);
    }),

  // Get Discord members for a guild
  getGuildMembers: protectedProcedure
    .input(
      z.object({
        guildId: z.string(),
        search: z.string().optional(),
        skip: z.number().min(0).default(0),
        take: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);
      
      return discordMemberSyncService.getGuildMembers(input.guildId, {
        skip: input.skip,
        take: input.take,
        search: input.search,
      });
    }),

  // Link Discord member to user
  linkDiscordMember: protectedProcedure
    .input(
      z.object({
        discordMemberId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);
      
      return ctx.db.discordMember.update({
        where: { id: input.discordMemberId },
        data: { userId: input.userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });
    }),

  // Unlink Discord member from user
  unlinkDiscordMember: protectedProcedure
    .input(z.object({ discordMemberId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);
      
      return ctx.db.discordMember.update({
        where: { id: input.discordMemberId },
        data: { userId: null },
      });
    }),

  // ========== USER ROLE MANAGEMENT ==========

  // Create viewer account (admin only)
  createViewerAccount: protectedProcedure
    .input(createViewerAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);

      // Check if email already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await hash(input.password, 12);

      // Create viewer account
      return ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: "VIEWER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    }),

  // Update user role (admin only)
  updateUserRole: protectedProcedure
    .input(updateUserRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);

      // Prevent admin from changing their own role
      if (input.userId === currentUser.id) {
        throw new Error("Cannot change your own role");
      }

      return ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true,
        },
      });
    }),

  // Get all users including viewers (admin only)
  getAllUsers: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);

      const { search, role, limit, offset } = input;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
        ];
      }

      if (role) {
        where.role = role;
      }

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            userTags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        ctx.db.user.count({ where }),
      ]);

      return {
        users,
        total,
        hasMore: total > offset + limit,
      };
    }),

  // ========== TAG MANAGEMENT ==========

  // Get all tags (admin only)
  getAllTags: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { id: true, role: true },
    });
    
    if (!currentUser) {
      throw new Error("User not found");
    }
    
    requireAdmin(currentUser);

    return ctx.db.tag.findMany({
      include: {
        _count: {
          select: {
            userTags: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  // Create tag (admin only)
  createTag: protectedProcedure
    .input(createTagSchema)
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);

      // Check if tag name already exists
      const existingTag = await ctx.db.tag.findUnique({
        where: { name: input.name },
      });

      if (existingTag) {
        throw new Error("Tag with this name already exists");
      }

      return ctx.db.tag.create({
        data: input,
      });
    }),

  // Update tag (admin only)
  updateTag: protectedProcedure
    .input(updateTagSchema)
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);

      const { id, ...updateData } = input;

      // Check if tag name already exists (excluding current tag)
      if (updateData.name) {
        const existingTag = await ctx.db.tag.findFirst({
          where: {
            name: updateData.name,
            NOT: { id },
          },
        });

        if (existingTag) {
          throw new Error("Tag with this name already exists");
        }
      }

      return ctx.db.tag.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete tag (admin only)
  deleteTag: protectedProcedure
    .input(deleteTagSchema)
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);

      // Delete tag and all related UserTag entries will be cascade deleted
      return ctx.db.tag.delete({
        where: { id: input.id },
      });
    }),

  // Assign tag to user (admin only)
  assignTagToUser: protectedProcedure
    .input(assignTagToUserSchema)
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);

      // Check if user-tag combination already exists
      const existingUserTag = await ctx.db.userTag.findUnique({
        where: {
          userId_tagId: {
            userId: input.userId,
            tagId: input.tagId,
          },
        },
      });

      if (existingUserTag) {
        throw new Error("User already has this tag");
      }

      return ctx.db.userTag.create({
        data: input,
        include: {
          tag: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  // Remove tag from user (admin only)
  removeTagFromUser: protectedProcedure
    .input(removeTagFromUserSchema)
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      requireAdmin(currentUser);

      return ctx.db.userTag.delete({
        where: {
          userId_tagId: {
            userId: input.userId,
            tagId: input.tagId,
          },
        },
      });
    }),
});
