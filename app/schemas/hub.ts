import { z } from "zod";

export const HubVisibility = z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]);
export type HubVisibilityType = z.infer<typeof HubVisibility>;

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
