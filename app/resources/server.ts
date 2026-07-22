export type ServerResource = {
  metadata: { id: string; name: string; iconUrl: string | null };
  spec: {
    hideServerName: boolean;
    pingOnMatch: boolean;
    autoRequeueOnSkip: boolean;
    autoRequeueOnHangup: boolean;
    filterNsfw: boolean;
    lobbyChannelIds: string[];
  };
  status: { botInstalled: boolean; manageable: boolean; callCount: number; messageCount: number };
};

export type DiscordChannelResource = { id: string; name: string; type: number; canCreateWebhook: boolean };
