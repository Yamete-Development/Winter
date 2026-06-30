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

const patternsValidation = z.array(
  z.object({
    pattern: z.string().min(1),
    matchType: z.enum(["EXACT", "PREFIX", "SUFFIX", "WILDCARD"]),
  })
).superRefine((val, ctx) => {
  const regexChars = /[.?+^$|()\[\]{}\\]/;
  for (const pat of val) {
    if (regexChars.test(pat.pattern)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Regex characters are not supported: ${pat.pattern}`,
      });
    }
  }
});

const whitelistValidation = z.array(z.string()).superRefine((val, ctx) => {
  const regexChars = /[.?+^$|()\[\]{}\\]/;
  for (const wl of val) {
    if (regexChars.test(wl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Regex characters are not allowed in whitelist: ${wl}`,
      });
    }
    if (wl.includes("*")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Wildcards (*) are not allowed in whitelist: ${wl}`,
      });
    }
  }
});

export const createAutomodRuleSchema = z.object({
  hubId: z.string(),
  name: z.string().min(1, "Rule name is required"),
  actions: z.array(z.enum(blockWordAction.enumValues)),
  muteDurationMinutes: z.number().nullable().optional(),
  patterns: patternsValidation,
  whitelist: whitelistValidation,
});

export const updateAutomodRuleSchema = z.object({
  hubId: z.string(),
  ruleId: z.string(),
  name: z.string().min(1, "Rule name is required").optional(),
  enabled: z.boolean().optional(),
  actions: z.array(z.enum(blockWordAction.enumValues)).optional(),
  muteDurationMinutes: z.number().nullable().optional(),
  patterns: patternsValidation.optional(),
  whitelist: whitelistValidation.optional(),
});

export const deleteAutomodRuleSchema = z.object({
  hubId: z.string(),
  ruleId: z.string(),
});
