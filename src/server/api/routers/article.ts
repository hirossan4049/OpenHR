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

const createArticleSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url(),
  platform: z.enum(["qiita", "zenn", "note", "blog", "other"]),
  publishedAt: dateInput.optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
});

const updateArticleSchema = createArticleSchema.extend({
  id: z.string(),
});

export const articleRouter = createTRPCRouter({
  // Get all articles for the current user
  getMyArticles: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.article.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      orderBy: {
        publishedAt: "desc",
      },
    });
  }),

  // Get all public articles (for sponsors/viewers)
  getPublicArticles: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        platform: z.enum(["qiita", "zenn", "note", "blog", "other"]).optional(),
        tags: z.array(z.string()).optional(),
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

      if (input.platform) {
        where.platform = input.platform;
      }

      if (input.tags && input.tags.length > 0) {
        // JSON contains search for tags
        where.tags = {
          contains: JSON.stringify(input.tags[0]), // Simplified search
        };
      }

      return ctx.db.article.findMany({
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
          publishedAt: "desc",
        },
        take: input.limit,
        skip: input.offset,
      });
    }),

  // Get specific article
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const article = await ctx.db.article.findUnique({
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

      if (!article || !article.isPublic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found or not public",
        });
      }

      return article;
    }),

  // Create article
  create: protectedProcedure
    .input(createArticleSchema)
    .mutation(async ({ ctx, input }) => {
      const tagsJson = input.tags ? JSON.stringify(input.tags) : null;

      return ctx.db.article.create({
        data: {
          ...input,
          tags: tagsJson,
          createdById: ctx.session.user.id,
        },
      });
    }),

  // Update article
  update: protectedProcedure
    .input(updateArticleSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if user owns this article
      const existingArticle = await ctx.db.article.findUnique({
        where: { id },
        select: { createdById: true },
      });

      if (!existingArticle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      if (existingArticle.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own articles",
        });
      }

      const tagsJson = updateData.tags ? JSON.stringify(updateData.tags) : null;

      return ctx.db.article.update({
        where: { id },
        data: {
          ...updateData,
          tags: tagsJson,
        },
      });
    }),

  // Delete article
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user owns this article
      const existingArticle = await ctx.db.article.findUnique({
        where: { id: input.id },
        select: { createdById: true },
      });

      if (!existingArticle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      if (existingArticle.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own articles",
        });
      }

      return ctx.db.article.delete({
        where: { id: input.id },
      });
    }),
});
