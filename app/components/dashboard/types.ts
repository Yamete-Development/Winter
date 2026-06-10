import type { AntiSwearRule } from "../BlockedWordsManager";
import type { PermissionAction } from "../../permissions/config";

export type DashboardBackgroundSearchResult = {
  id: string;
  imageUrl: string;
  previewUrl: string;
  thumbUrl: string;
  label: string;
  photographerName: string;
  photographerUrl: string;
  downloadLocation?: string;
};

export type DashboardHub = {
  id: string;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  verified: boolean;
  partnered: boolean;
  weeklyMsgs: string;
};

export type DashboardConnection = {
  name: string;
  channel: string;
  connected: boolean;
};

export type DashboardChatLog = {
  id?: string;
  sender: string;
  origin: string;
  text: string;
  badge: string;
  avatarUrl?: string | null;
  createdAt?: Date | string;
};

export type DashboardHubConfig = {
  nsfw: boolean;
  locked: boolean;
  profanityFilter: boolean;
  appealCooldown: number;
  antiSwearRules: AntiSwearRule[];
  welcomeMessage: string;
  connections: DashboardConnection[];
  chatLogs: DashboardChatLog[];
  permissions: Record<PermissionAction, boolean>;
  effectiveRole: string;
};

export type DashboardConfigs = Record<string, DashboardHubConfig>;

export type DashboardLayouts = {
  moderation: any;
  general: any;
};

export type DashboardTabKey = "moderation" | "general";