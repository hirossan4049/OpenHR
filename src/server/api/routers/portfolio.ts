import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const dateInput = z.preprocess((value) => {
  if (typeof value === "string" && value) {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? value : new Date(parsed);
  }
  return value;
}, z.date());

const createPortfolioSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  url: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  projectType: z.enum(["personal", "hackathon", "team", "assignment"]).default("personal"),
  technologies: z.array(z.string()).optional(),
  startDate: dateInput.optional(),
  endDate: dateInput.optional(),
  isPublic: z.boolean().default(true),
});

const updatePortfolioSchema = createPortfolioSchema.extend({
  id: z.string(),
});

export const portfolioRouter = createTRPCRouter({
  // Get all portfolios for the current user
  getMyPortfolios: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.portfolio.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  // Get all public portfolios (for sponsors/viewers)
  getPublicPortfolios: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        projectType: z.enum(["personal", "hackathon", "team", "assignment"]).optional(),
        technologies: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        isPublic: true,
      };

      if (input.userId) {
        where.createdById = input.userId;
      }

      if (input.projectType) {
        where.projectType = input.projectType;
      }

      if (input.technologies && input.technologies.length > 0) {
        // JSON contains search for technologies
        where.technologies = {
          contains: JSON.stringify(input.technologies[0]), // Simplified search
        };
      }

      return ctx.db.portfolio.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
              grade: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit,
        skip: input.offset,
      });
    }),

  // Get specific portfolio
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const portfolio = await ctx.db.portfolio.findUnique({
        where: { id: input.id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
              grade: true,
            },
          },
        },
      });

      if (!portfolio || !portfolio.isPublic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Portfolio not found or not public",
        });
      }

      return portfolio;
    }),

  // Create portfolio
  create: protectedProcedure
    .input(createPortfolioSchema)
    .mutation(async ({ ctx, input }) => {
      const technologiesJson = input.technologies ? JSON.stringify(input.technologies) : null;

      return ctx.db.portfolio.create({
        data: {
          ...input,
          technologies: technologiesJson,
          createdById: ctx.session.user.id,
        },
      });
    }),

  // Update portfolio
  update: protectedProcedure
    .input(updatePortfolioSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if user owns this portfolio
      const existingPortfolio = await ctx.db.portfolio.findUnique({
        where: { id },
        select: { createdById: true },
      });

      if (!existingPortfolio) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Portfolio not found",
        });
      }

      if (existingPortfolio.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own portfolios",
        });
      }

      const technologiesJson = updateData.technologies ? JSON.stringify(updateData.technologies) : null;

      return ctx.db.portfolio.update({
        where: { id },
        data: {
          ...updateData,
          technologies: technologiesJson,
        },
      });
    }),

  // Delete portfolio
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user owns this portfolio
      const existingPortfolio = await ctx.db.portfolio.findUnique({
        where: { id: input.id },
        select: { createdById: true },
      });

      if (!existingPortfolio) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Portfolio not found",
        });
      }

      if (existingPortfolio.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own portfolios",
        });
      }

      return ctx.db.portfolio.delete({
        where: { id: input.id },
      });
    }),
});
