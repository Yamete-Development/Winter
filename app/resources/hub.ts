import type { PermissionAction } from "../permissions/config";

export type ResourceMetadata = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  effectiveRole: string;
  permissions: Record<PermissionAction, boolean>;
};

export type HubSpec = {
  description: string;
  shortDescription: string | null;
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  language: string | null;
  region: string | null;
  welcomeMessage: string | null;
  iconUrl: string | null;
  bannerUrl: string | null;
  locked: boolean;
  nsfw: boolean;
  rules: string[];
  appealCooldownHours: number;
};

export type HubStatus = {
  activityLevel: "LOW" | "MEDIUM" | "HIGH";
  verified: boolean;
  partnered: boolean;
  featured: boolean;
  weeklyMessageCount: number;
  averageRating: number | null;
  connectionCount: number;
  upvoteCount: number;
  reviewCount: number;
};

export type HubResource = {
  metadata: ResourceMetadata;
  spec: HubSpec;
  status: HubStatus;
};
