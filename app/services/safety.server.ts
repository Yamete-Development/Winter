import type { SafetyItemResource, SafetyItemType } from "~/resources/safety";
import { permissionService } from "./permission.server";
import { polarizerClient } from "./polarizer.server";

function timestamp(value: any): string | null {
  if (!value?.seconds) return null;
  return new Date(Number(value.seconds) * 1000 + Math.floor(Number(value.nanos || 0) / 1_000_000)).toISOString();
}

function normalize(type: SafetyItemType, item: any): SafetyItemResource {
  const reasonCodes = item.reasonCodes || [];
  const summary = type === "review" ? (reasonCodes.join(", ") || "Message held before delivery")
    : type === "report" ? (item.description || item.type || "Member report")
    : type === "appeal" ? (item.reason || "Moderation appeal")
    : item.reason || `${type[0].toUpperCase()}${type.slice(1)} record`;
  return {
    metadata: { id: item.id, createdAt: timestamp(item.createdAt), version: Number(item.version || 0) },
    spec: { type, summary, reasonCodes, subject: item.subject || {}, priority: item.priority },
    status: { state: item.status || "RESOURCE_STATUS_UNSPECIFIED", assignedTo: item.assignedTo, resolvedBy: item.resolvedBy },
  };
}

export const safetyService = {
  async list(actorId: string, input: { hubId: string; type: SafetyItemType; cursor?: string }) {
    await permissionService.assertCanPerform(actorId, input.hubId, "VIEW_LOGS");
    const methods = {
      review: polarizerClient.listReviews,
      report: polarizerClient.listReports,
      appeal: polarizerClient.listAppeals,
      infraction: polarizerClient.listInfractions,
      restriction: polarizerClient.listRestrictions,
    };
    const response = await methods[input.type](actorId, input.hubId, input.cursor);
    const collection = response.items || response.reports || response.appeals || response.infractions || response.restrictions || [];
    return { items: collection.map((item: any) => normalize(input.type, item)), nextCursor: response.page?.nextCursor || null };
  },

  async adjudicate(actorId: string, hubId: string, input: { reviewItemId: string; resolution: "APPROVE" | "REJECT" | "EXPIRE"; reason: string; expectedVersion: number }) {
    await permissionService.assertCanPerform(actorId, hubId, "MODERATE_MESSAGES");
    const result = await polarizerClient.adjudicateHeld(actorId, input);
    return { state: result.state, version: Number(result.version), deliveryPending: input.resolution === "APPROVE" };
  },
};
