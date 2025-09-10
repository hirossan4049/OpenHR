import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure
} from "~/server/api/trpc";
import { skillSearchSchema, skillSuggestionSchema } from "~/lib/validation/skill";

export const userRouter = createTRPCRouter({
  // Get all members for directory with optional search filters
  getMembers: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      skillId: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { search, skillId, limit, offset } = input;

      const where: any = {};

      // Build search conditions
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { bio: { contains: search } },
          { grade: { contains: search } },
          { userSkills: { some: { skill: { name: { contains: search } } } } },
        ];
      }

      if (skillId) {
        where.userSkills = {
          some: {
            skillId: skillId,
          },
        };
      }

      const [members, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          include: {
            userSkills: {
              include: {
                skill: true,
              },
            },
          },
          orderBy: [
            { name: "asc" },
          ],
          take: limit,
          skip: offset,
        }),
        ctx.db.user.count({ where }),
      ]);

      return {
        members: members.map((member: any) => ({
          id: member.id,
          name: member.name,
          bio: member.bio,
          grade: member.grade,
          contact: member.contact,
          githubUrl: member.githubUrl,
          image: member.image,
          skills: member.userSkills.map((us: any) => ({
            id: us.skill.id,
            name: us.skill.name,
            level: us.level,
            yearsOfExp: us.yearsOfExp,
            category: us.skill.category,
          })),
        })),
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get member by ID for profile detail
  getMemberById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.db.user.findUnique({
        where: { id: input.id },
        include: {
          userSkills: {
            include: {
              skill: true,
            },
          },
        },
      });

      if (!member) {
        throw new Error("Member not found");
      }

      return {
        id: member.id,
        name: member.name,
        bio: member.bio,
        grade: member.grade,
        contact: member.contact,
        githubUrl: member.githubUrl,
        image: member.image,
        skills: member.userSkills.map((us: any) => ({
          id: us.skill.id,
          name: us.skill.name,
          level: us.level,
          yearsOfExp: us.yearsOfExp,
          category: us.skill.category,
        })),
      };
    }),

  // Get all skills for filter dropdown
  getAllSkills: publicProcedure.query(async ({ ctx }) => {
    const skills = await ctx.db.skill.findMany({
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    });

    return skills;
  }),

  // Search skills with aliases support
  searchSkills: publicProcedure
    .input(skillSearchSchema)
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;
      const q = query.trim();
      const qLower = q.toLowerCase();

      // Fetch a reasonable superset and filter in memory to ensure case-insensitive matching across JSON aliases
      const all = await ctx.db.skill.findMany({
        orderBy: [
          { verified: "desc" },
          { name: "asc" },
        ],
        take: 1000,
      });

      const filtered = all.filter((s) => {
        let aliases: string[] = [];
        try {
          aliases = s.aliases ? (JSON.parse(s.aliases) as string[]) : [];
        } catch {
          aliases = [];
        }
        const haystack = [s.name ?? "", s.slug ?? "", ...aliases].join(" ").toLowerCase();
        return haystack.includes(qLower);
      });

      const results = filtered.slice(0, limit);

      return results.map((skill) => ({
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
        logoUrl: skill.logoUrl,
        aliases: (() => { try { return skill.aliases ? JSON.parse(skill.aliases) : []; } catch { return []; } })(),
        verified: skill.verified,
        category: skill.category,
      }));
    }),

  // Suggest new skill creation
  suggestSkill: publicProcedure
    .input(skillSuggestionSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, category } = input;
      
      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      // Check if skill already exists
      const existingSkill = await ctx.db.skill.findFirst({
        where: {
          OR: [
            { name: { equals: name } },
            { slug: slug },
          ],
        },
      });

      if (existingSkill) {
        return { skill: existingSkill, created: false };
      }

      // Create new unverified skill
      const newSkill = await ctx.db.skill.create({
        data: {
          name,
          slug,
          category: category || null,
          verified: false, // New skills start as unverified
        },
      });

      return { skill: newSkill, created: true };
    }),
});
