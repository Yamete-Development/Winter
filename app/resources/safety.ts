export type SafetyItemType = "review" | "report" | "appeal" | "infraction" | "restriction";

export type SafetyItemResource = {
  metadata: { id: string; createdAt: string | null; version: number };
  spec: {
    type: SafetyItemType;
    summary: string;
    reasonCodes: string[];
    subject: { userId?: string; serverId?: string; messageId?: string; reportId?: string };
    priority?: number;
  };
  status: { state: string; assignedTo?: string; resolvedBy?: string };
};
