import { base } from "./context";
import { hubRouter } from "./routers/hub";
import { moderationRouter } from "./routers/moderation";
import { preferencesRouter } from "./routers/preferences";

export const appRouter = base.router({
  hub: hubRouter,
  moderation: moderationRouter,
  preferences: preferencesRouter,
});

export type AppRouter = typeof appRouter;
