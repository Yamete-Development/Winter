import { Button, Space, Typography } from "antd";
import { WarningOutlined } from "@ant-design/icons";

import { dashboardGlassCardStyle } from "./shared";

const { Text } = Typography;

type UnsavedChangesBannerProps = {
  isDirty: boolean;
  onReset: () => void;
  onSave: () => void;
  isSaving?: boolean;
};

export function UnsavedChangesBanner({ isDirty, onReset, onSave, isSaving }: UnsavedChangesBannerProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: isDirty ? 24 : -100,
        left: "50%",
        transform: "translateX(-50%)",
        transition: "bottom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        zIndex: 1000,
        pointerEvents: isDirty ? "auto" : "none",
        visibility: isDirty ? "visible" : "hidden",
      }}
    >
      <div
        style={{
          ...dashboardGlassCardStyle,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          borderRadius: 8,
          padding: "12px 16px 12px 24px",
          display: "flex",
          alignItems: "center",
          gap: 32,
          minWidth: 500,
          width: "auto",
          height: "auto",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <WarningOutlined style={{ color: "#faad14", fontSize: 18 }} />
          <Text strong style={{ color: "white", fontSize: "0.95rem" }}>
            Careful — you have unsaved changes!
          </Text>
        </div>
        <Space size="middle">
          <Button type="text" onClick={onReset} disabled={isSaving} style={{ color: "rgba(255,255,255,0.7)" }} className="hover:text-white">
            Reset
          </Button>
          <Button type="primary" onClick={onSave} loading={isSaving} style={{ background: "#10b981", borderColor: "#10b981", fontWeight: 600 }}>
            Save Changes
          </Button>
        </Space>
      </div>
    </div>
  );
}
