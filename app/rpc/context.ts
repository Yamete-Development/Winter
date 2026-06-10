import { os, ORPCError } from "@orpc/server";
import { requireUser } from "../services/auth.server";

export type ORPCContext = {
  request: Request;
};

export const base = os.$context<ORPCContext>().use(async ({ next, path }) => {
  try {
    return await next({});
  } catch (error) {
    console.error(`[ORPC 500] Error in /${path.join('/')}:`, error);
    throw error;
  }
});

export const protectedBase = base.use(async ({ context, next }) => {
  try {
    const user = await requireUser(context.request);
    
    return next({
      context: {
        ...context,
        user,
      },
    });
  } catch (error) {
    if (error instanceof Response) {
      throw new ORPCError("UNAUTHORIZED", { message: "Not authenticated" });
    }
    throw error;
  }
});
