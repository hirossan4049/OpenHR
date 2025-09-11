import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { skillMasterSchema } from "~/lib/validation/skill";
import { discordMemberSyncService } from "~/server/services/discord-member-sync";

export const adminRouter = createTRPCRouter({
  // Get all skills with usage statistics (admin only)
  getAllSkillsWithStats: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Add admin role check
    
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
      // TODO: Add admin role check
      
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
      // TODO: Add admin role check
      
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
      // TODO: Add admin role check
      
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
      // TODO: Add admin role check
      
      return ctx.db.skill.updateMany({
        where: { id: { in: input.skillIds } },
        data: { verified: true },
      });
    }),

  // Import skills from JSON
  importSkills: protectedProcedure
    .input(z.array(skillMasterSchema))
    .mutation(async ({ ctx, input }) => {
      // TODO: Add admin role check
      
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
    // TODO: Add admin role check
    
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
    .mutation(async ({ input }) => {
      // TODO: Add admin role check
      
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
    .query(async ({ input }) => {
      // TODO: Add admin role check
      
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
      // TODO: Add admin role check
      
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
      // TODO: Add admin role check
      
      return ctx.db.discordMember.update({
        where: { id: input.discordMemberId },
        data: { userId: null },
      });
    }),
});
