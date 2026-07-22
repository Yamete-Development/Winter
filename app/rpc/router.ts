import { base } from "./context";
import { hubRouter } from "./routers/hub";
import { moderationRouter } from "./routers/moderation";
import { preferencesRouter } from "./routers/preferences";
import { serverRouter } from "./routers/server";
import { safetyRouter } from "./routers/safety";

export const appRouter = base.router({
  hub: hubRouter,
  moderation: moderationRouter,
  preferences: preferencesRouter,
  server: serverRouter,
  safety: safetyRouter,
});

export type AppRouter = typeof appRouter;
