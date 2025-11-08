import { userRouter } from "~/server/api/routers/user";
import { adminRouter } from "~/server/api/routers/admin";
import { projectRouter } from "~/server/api/routers/project";
import { portfolioRouter } from "~/server/api/routers/portfolio";
import { articleRouter } from "~/server/api/routers/article";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  admin: adminRouter,
  project: projectRouter,
  portfolio: portfolioRouter,
  article: articleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
