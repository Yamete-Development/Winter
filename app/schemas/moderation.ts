import { z } from "zod";

export const automodRuleItemSchema = z.object({
  id: z.string().optional(), // optional because new rules won't have an ID yet (or they have a random one that we will ignore/regenerate on server)
  pattern: z.string().min(1),
  matchType: z.enum(["exact", "wildcard", "prefix", "suffix"]),
  actions: z.array(z.string()),
});

export const batchUpdateAutomodRulesSchema = z.object({
  hubId: z.string(),
  rules: z.array(automodRuleItemSchema),
});
