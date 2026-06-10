import { GlobalOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";

const { Title, Text } = Typography;

type EmptyDashboardStateProps = {
  onCreateHub: () => void;
};

export function EmptyDashboardState({ onCreateHub }: EmptyDashboardStateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
      <div
        style={{
          background: "rgba(24, 24, 28, 0.65)",
          padding: "50px 70px",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(145, 70, 255, 0.2) 0%, rgba(145, 70, 255, 0.05) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            border: "1px solid rgba(145, 70, 255, 0.3)",
          }}
        >
          <GlobalOutlined style={{ fontSize: 28, color: "#b685ff" }} />
        </div>
        <Title level={2} style={{ margin: 0, marginBottom: 12, color: "white", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Ready to connect?
        </Title>
        <Text type="secondary" style={{ marginBottom: 36, fontSize: "1.15rem", textAlign: "center", maxWidth: 360, lineHeight: 1.6, color: "rgba(255,255,255,0.6)" }}>
          Create your first hub to start moderating and linking chat across multiple communities.
        </Text>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          style={{
            background: "linear-gradient(135deg, #9146ff 0%, #7c2aff 100%)",
            border: "none",
            height: 52,
            padding: "0 40px",
            fontSize: "1.1rem",
            fontWeight: 600,
            borderRadius: 26,
            boxShadow: "0 8px 16px rgba(145, 70, 255, 0.25)",
          }}
          onClick={onCreateHub}
        >
          Create Hub
        </Button>
      </div>
    </div>
  );
}