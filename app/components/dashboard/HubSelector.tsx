import { PlusOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Col, Typography } from "antd";
import { DashboardSectionCard, DashboardSectionTitle } from "./shared";
import type { DashboardConfigs, DashboardHub } from "./types";

const { Text } = Typography;

type HubSelectorProps = {
  hubs: DashboardHub[];
  configs: DashboardConfigs;
  selectedHubId: string;
  onSelectHub: (hubId: string) => void;
  onCreateHub: () => void;
};

export function HubSelector({ hubs, configs, selectedHubId, onSelectHub, onCreateHub }: HubSelectorProps) {
  return (
    <Col xs={24} lg={6} style={{ paddingTop: 24, height: "100%", display: "flex", flexDirection: "column" }}>
      <DashboardSectionCard
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <DashboardSectionTitle>My Interchat Hubs</DashboardSectionTitle>
            <Button type="primary" size="small" icon={<PlusOutlined />} style={{ background: "#9146ff", border: "none", borderRadius: 4, fontWeight: 600 }} onClick={onCreateHub}>
              New
            </Button>
          </div>
        }
        styles={{ body: { padding: 0, overflowY: "auto", flex: 1 }, header: { borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "16px 20px" } }}
        style={{ flex: 1, minHeight: 0 }}
      >
        <div className="dark-scrollbar" style={{ overflowY: "auto", flex: 1 }}>
          {hubs.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
                You don't own any hubs yet.
              </Text>
              <Button type="primary" icon={<PlusOutlined />} style={{ background: "#9146ff" }} onClick={onCreateHub}>
                Create Hub
              </Button>
            </div>
          ) : (
            hubs.map((hub) => {
              const hubConfig = configs[hub.id];
              const isActive = hubConfig?.connections.some((connection) => connection.connected) ?? false;
              const isSelected = selectedHubId === hub.id;

              return (
                <div
                  key={hub.id}
                  onClick={() => onSelectHub(hub.id)}
                  style={{
                    padding: "16px 20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: isSelected ? "rgba(124, 58, 237, 0.08)" : "transparent",
                    borderLeft: isSelected ? "3px solid #7c3aed" : "3px solid transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Badge dot color="#4ade80" offset={[-4, 38]} style={{ display: isActive ? "block" : "none" }}>
                    <Avatar shape="square" size={44} src={hub.avatarUrl} style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }} />
                  </Badge>
                  <div>
                    <Text strong style={{ color: isSelected ? "#fff" : "rgba(255,255,255,0.85)", fontSize: "0.95rem", display: "block" }}>
                      {hub.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "0.8rem" }}>
                      {hub.weeklyMsgs} msgs/wk
                    </Text>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DashboardSectionCard>
    </Col>
  );
}