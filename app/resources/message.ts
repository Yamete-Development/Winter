export type BaseResourceMetadata = {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt: string | null;
};
export type MessageSpec = {
  content: string;
  authorId: string;
  guildId: string;
  imageUrl: string | null;
};

export type MessageStatus = {
  authorName: string | null;
  authorAvatarUrl: string | null;
  guildName: string | null;
  badges: string[];
};

export type MessageResource = {
  metadata: BaseResourceMetadata;
  spec: MessageSpec;
  status: MessageStatus;
};
