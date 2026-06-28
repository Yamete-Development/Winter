export type BaseResourceMetadata = {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt: string | null;
};
export type HubConnectionSpec = {
  channelId: string;
  serverId: string;
  connected: boolean;
  pausedByBot: boolean;
};

export type HubConnectionStatus = {
  serverName: string;
  channelName: string | null;
  lastActive: string;
};

export type HubConnectionResource = {
  metadata: BaseResourceMetadata;
  spec: HubConnectionSpec;
  status: HubConnectionStatus;
};
