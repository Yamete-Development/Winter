import { z } from "zod";
import { blockWordAction } from "../../drizzle/schema";

export const automodRuleItemSchema = z.object({
  id: z.string().optional(),
  pattern: z.string().min(1),
  matchType: z.enum(["exact", "wildcard", "prefix", "suffix"]),
  actions: z.array(z.enum(blockWordAction.enumValues)),
});

export const batchUpdateAutomodRulesSchema = z.object({
  hubId: z.string(),
  rules: z.array(automodRuleItemSchema),
});
