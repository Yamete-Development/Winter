export type BaseResourceMetadata = {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt: string | null;
};
export type AutomodPattern = {
  id: string;
  pattern: string;
  matchType: "EXACT" | "PREFIX" | "SUFFIX" | "WILDCARD";
};

export type AutomodRuleSpec = {
  name: string;
  enabled: boolean;
  muteDurationMinutes: number | null;
  actions: string[]; // E.g., 'BLOCK_MESSAGE', 'WARN', etc.
  patterns: AutomodPattern[];
};

export type AutomodRuleResource = {
  metadata: BaseResourceMetadata;
  spec: AutomodRuleSpec;
};

export type InfractionSpec = {
  type: "BAN" | "BLACKLIST" | "MUTE" | "WARNING";
  reason: string;
  expiresAt: string | null;
  targetType: "USER" | "SERVER";
  userId: string | null;
  serverId: string | null;
};

export type InfractionStatus = {
  status: "ACTIVE" | "REVOKED" | "APPEALED";
  targetName: string | null;
  targetAvatarUrl: string | null;
  moderatorName: string | null;
};

export type InfractionResource = {
  metadata: BaseResourceMetadata;
  spec: InfractionSpec;
  status: InfractionStatus;
};
