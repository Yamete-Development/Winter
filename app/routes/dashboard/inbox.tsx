import { CheckOutlined, CloseOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input, message, Modal, Segmented } from "antd";
import { useSearchParams } from "react-router";
import { orpc } from "~/lib/orpc";
import type { SafetyItemType } from "~/resources/safety";
import type { SafetyItemResource } from "~/resources/safety";
import { PageHeader } from "~/components/dashboard/WorkspacePrimitives";

const types: Array<{ label: string; value: SafetyItemType }> = [
  { label: "Held", value: "review" }, { label: "Reports", value: "report" }, { label: "Appeals", value: "appeal" },
  { label: "Infractions", value: "infraction" }, { label: "Restrictions", value: "restriction" },
];

export default function InboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = (searchParams.get("type") || "review") as SafetyItemType;
  const queryClient = useQueryClient();
  const { data: hubs = [] } = useQuery(orpc.hub.getUserHubs.queryOptions());
  const hubId = searchParams.get("hubId") || hubs[0]?.metadata.id || "";
  const { data, isLoading, isError, error } = useQuery(orpc.safety.list.queryOptions({ input: { hubId, type }, enabled: !!hubId }));
  const adjudicate = useMutation(orpc.safety.adjudicateHeld.mutationOptions());
  const setFilter = (key: string, value: string) => { const next = new URLSearchParams(searchParams); next.set(key, value); if (key === "hubId") next.delete("cursor"); setSearchParams(next); };

  const review = (item: SafetyItemResource, resolution: "APPROVE" | "REJECT" | "EXPIRE") => {
    let reason = "";
    Modal.confirm({
      title: resolution === "APPROVE" ? "Approve held message" : resolution === "REJECT" ? "Reject held message" : "Expire held message",
      content: <div className="dashboard-field" style={{ marginTop: 16 }}><label htmlFor="review-reason">Resolution reason</label><Input.TextArea id="review-reason" rows={4} maxLength={1000} onChange={(event) => { reason = event.target.value; }} /></div>,
      okText: resolution === "APPROVE" ? "Approve" : resolution === "REJECT" ? "Reject" : "Expire",
      okType: resolution === "APPROVE" ? "primary" : "danger",
      onOk: async () => {
        if (reason.trim().length < 3) { message.error("Add a clear resolution reason."); throw new Error("reason required"); }
        const result = await adjudicate.mutateAsync({ hubId, reviewItemId: item.metadata.id, resolution, reason: reason.trim(), expectedVersion: item.metadata.version });
        message.success(result.deliveryPending ? "Approval recorded · delivery pending" : "Review resolved");
        await queryClient.invalidateQueries({ queryKey: orpc.safety.list.key() });
      },
    });
  };

  return <>
    <PageHeader eyebrow="Safety inbox" title="Review what needs attention" description="Authoritative held actions and moderation records from Polarizer, limited to Hubs where Iris verifies your access." />
    <section className="dashboard-section"><div className="dashboard-actions">
      <select className="dashboard-select" style={{ width: "min(320px, 100%)" }} value={hubId} onChange={(event) => setFilter("hubId", event.target.value)} aria-label="Hub scope">{hubs.map((hub) => <option value={hub.metadata.id} key={hub.metadata.id}>{hub.metadata.name}</option>)}</select>
      <Segmented value={type} options={types} onChange={(value) => setFilter("type", String(value))} />
    </div></section>
    {!hubId && <div className="dashboard-empty"><h3>No Hub selected</h3><p>You need an Iris-authorized Hub before safety work can be shown.</p></div>}
    {isError && <div className="dashboard-alert">{error instanceof Error ? error.message : "Safety data is temporarily unavailable."}</div>}
    {isLoading && <div className="dashboard-alert dashboard-alert--sage">Loading authoritative safety records…</div>}
    {data && <section className="dashboard-section"><div className="dashboard-panel dashboard-panel--wide">{data.items.map((item: SafetyItemResource) => <div className="dashboard-row" key={item.metadata.id}>
      <div className="dashboard-row__identity"><span className="dashboard-avatar">{item.spec.type.slice(0, 2).toUpperCase()}</span><div><strong>{item.spec.summary}</strong><small>{item.spec.subject.messageId ? `Message ${item.spec.subject.messageId}` : item.spec.subject.userId ? `User ${item.spec.subject.userId}` : item.metadata.id}</small></div></div>
      <div className="dashboard-row__meta">{item.metadata.createdAt ? new Date(item.metadata.createdAt).toLocaleString() : "Time unavailable"}</div>
      <span className="dashboard-status dashboard-status--attention">{item.status.state.replace("RESOURCE_STATUS_", "").toLowerCase()}</span>
      {item.spec.type === "review" ? <div className="dashboard-actions"><button className="dashboard-icon-button" title="Approve delivery" aria-label="Approve held message" onClick={() => review(item, "APPROVE")}><CheckOutlined /></button><button className="dashboard-icon-button dashboard-button--danger" title="Reject message" aria-label="Reject held message" onClick={() => review(item, "REJECT")}><CloseOutlined /></button><button className="dashboard-icon-button" title="Expire message" aria-label="Expire held message" onClick={() => review(item, "EXPIRE")}><ClockCircleOutlined /></button></div> : <span />}
    </div>)}{data.items.length === 0 && <div className="dashboard-empty"><CheckOutlined /><h3>Nothing waiting here</h3><p>No matching {types.find((candidate) => candidate.value === type)?.label.toLowerCase()} records were returned for this Hub.</p></div>}</div></section>}
  </>;
}
