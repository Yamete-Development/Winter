import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { base, protectedBase } from "../context";
import { safetyService } from "~/services/safety.server";

const safetyType = z.enum(["review", "report", "appeal", "infraction", "restriction"]);

function mapError(error: unknown): never {
  const code = typeof error === "object" && error && "code" in error ? Number((error as { code: unknown }).code) : undefined;
  if (code === 7) throw new ORPCError("FORBIDDEN", { message: "Polarizer denied this safety operation." });
  if (code === 10 || code === 9 || code === 5) throw new ORPCError("CONFLICT", { message: "This item changed while you were reviewing it. Refresh and try again." });
  if (code === 4 || code === 14) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Safety data is temporarily unavailable." });
  throw error;
}

export const safetyRouter = base.router({
  list: protectedBase.input(z.object({ hubId: z.string(), type: safetyType, cursor: z.string().optional() })).handler(async ({ input, context }) => {
    try { return await safetyService.list(context.user.id, input); } catch (error) { return mapError(error); }
  }),
  adjudicateHeld: protectedBase.input(z.object({ hubId: z.string(), reviewItemId: z.string(), resolution: z.enum(["APPROVE", "REJECT", "EXPIRE"]), reason: z.string().trim().min(3).max(1000), expectedVersion: z.number().int().nonnegative() })).handler(async ({ input, context }) => {
    const { hubId, ...command } = input;
    try { return await safetyService.adjudicate(context.user.id, hubId, command); } catch (error) { return mapError(error); }
  }),
});
