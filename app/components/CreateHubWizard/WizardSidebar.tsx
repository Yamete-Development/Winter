import { CheckCircleOutlined } from "@ant-design/icons";
import { Tag, Typography } from "antd";
import { STEP_ITEMS } from "./types";

const { Paragraph, Text, Title } = Typography;

type WizardSidebarProps = {
  isFirstHub: boolean;
  currentStep: number;
};

export function WizardSidebar({ isFirstHub, currentStep }: WizardSidebarProps) {
  return (
    <div
      className="hub-wizard-sidebar"
      style={{
        width: 320,
        background: "#0f0f11",
        borderRight: "1px solid #27272a",
        padding: "40px 32px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="hub-wizard-sidebar__intro" style={{ marginBottom: 48 }}>
        <Tag
          style={{
            margin: 0,
            padding: "4px 8px",
            borderRadius: 6,
            background: "rgba(124, 58, 237, 0.15)",
            color: "#c4b5fd",
            fontWeight: 600,
            border: "1px solid rgba(124, 58, 237, 0.3)",
            marginBottom: 16,
            display: "inline-block",
          }}
        >
          {isFirstHub ? "First Hub Setup" : "New Hub"}
        </Tag>
        <Title level={3} style={{ margin: 0, color: "white", fontWeight: 600, letterSpacing: "-0.01em" }}>
          {isFirstHub ? "Launch your first bridge." : "Open another community lane."}
        </Title>
        <Paragraph style={{ color: "#a1a1aa", fontSize: "0.95rem", lineHeight: 1.5, marginTop: 12, marginBottom: 0 }}>
          {isFirstHub
            ? "Define the identity, set up defaults, and drop straight into the dashboard."
            : "Use the same flow to spin up another hub without leaving the dashboard."}
        </Paragraph>
      </div>

      <div className="hub-wizard-steps" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {STEP_ITEMS.map((item, index) => {
          const active = index === currentStep;
          const past = index < currentStep;
          return (
            <div className="hub-wizard-step" key={item.title} style={{ display: "flex", gap: 16, opacity: active || past ? 1 : 0.4, transition: "opacity 0.2s" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: active ? "#7c3aed" : past ? "#10b981" : "#27272a",
                  color: "white",
                  fontWeight: 600,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {past ? <CheckCircleOutlined style={{ fontSize: 14 }} /> : index + 1}
              </div>
              <div style={{ paddingTop: 2 }}>
                <Text strong style={{ display: "block", color: "white", marginBottom: 2 }}>
                  {item.title}
                </Text>
                <Text style={{ color: "#a1a1aa", fontSize: "0.85rem", lineHeight: 1.4 }}>
                  {item.description}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
