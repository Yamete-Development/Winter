import { Typography } from "antd";
import type { DashboardHub } from "./types";

const { Title, Text } = Typography;

type DashboardPageHeaderProps = {
  activeHub: DashboardHub;
};

export function DashboardPageHeader({ activeHub }: DashboardPageHeaderProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Text style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
        InterChat Control Center
      </Text>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <Title level={2} style={{ margin: 0, color: "white", lineHeight: 1.1 }}>
            Dashboard
          </Title>
          <Text type="secondary" style={{ fontSize: "0.95rem" }}>
            {activeHub.id === "empty-state"
              ? "Set up your first hub to start moderating and connecting communities."
              : `Managing ${activeHub.name} across moderation, automod, and connected guilds.`}
          </Text>
        </div>
      </div>
    </div>
  );
}