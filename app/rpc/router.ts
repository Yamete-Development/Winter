import { base } from "./context";
import { hubRouter } from "./routers/hub";
import { moderationRouter } from "./routers/moderation";

export const appRouter = base.router({
  hub: hubRouter,
  moderation: moderationRouter,
});

export type AppRouter = typeof appRouter;
