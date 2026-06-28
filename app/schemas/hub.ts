import { z } from "zod";

export const HubVisibility = z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]);
export type HubVisibilityType = z.infer<typeof HubVisibility>;

export const HubSettingsFlags = {
  REACTIONS: 1,
  HIDE_LINKS: 2,
  SPAM_FILTER: 4,
  BLOCK_INVITES: 8,
  USE_NICKNAMES: 16,
  BLOCK_NSFW: 32,
  ALLOW_VIDEOS: 64,
  BLOCK_ATTACHMENTS: 128,
  BLOCK_TENOR_GIFS: 256,
} as const;

export type HubSettingsFlag = keyof typeof HubSettingsFlags;

export function hasSettingsFlag(bitmask: number, flag: keyof typeof HubSettingsFlags): boolean {
  return (bitmask & HubSettingsFlags[flag]) !== 0;
}

export function toggleSettingsFlag(bitmask: number, flag: keyof typeof HubSettingsFlags, enabled: boolean): number {
  if (enabled) {
    return bitmask | HubSettingsFlags[flag];
  }
  return bitmask & ~HubSettingsFlags[flag];
}

export const createHubSchema = z.object({
  name: z.string()
    .min(1, "Add a hub name.")
    .max(100, "Hub name must be 100 characters or less."),
  shortDescription: z.string()
    .min(1, "Add a short description.")
    .max(100, "Short description must be 100 characters or less."),
  description: z.string()
    .max(1024, "Full description must be 1024 characters or less.")
    .optional(),
  visibility: HubVisibility.default("PUBLIC"),
  language: z.string().min(1, "Choose a primary language.").default("English"),
  region: z.string().min(1, "Choose a region.").default("Global"),
  welcomeMessage: z.string().optional(),
  iconUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
});

export type CreateHubInput = z.infer<typeof createHubSchema>;

export const patchHubConfigSchema = z.object({
  hubId: z.string(),
  nsfw: z.boolean().optional(),
  locked: z.boolean().optional(),
  appealCooldownHours: z.number().min(0).max(8760).optional(),
  welcomeMessage: z.string().max(2000).optional(),
  settings: z.number().int().min(0).optional(),
});

export type PatchHubConfigInput = z.infer<typeof patchHubConfigSchema>;
