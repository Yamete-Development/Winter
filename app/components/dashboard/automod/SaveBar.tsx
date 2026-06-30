import { Button, Space } from "antd";
import { WarningOutlined } from "@ant-design/icons";

interface SaveBarProps {
  isDirty: boolean;
  isValid: boolean;
  isLoading: boolean;
  onCancel: () => void;
  onSave: () => void;
  canManageRules: boolean;
}

export function SaveBar({
  isDirty,
  isValid,
  isLoading,
  onCancel,
  onSave,
  canManageRules,
}: SaveBarProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        background: "rgba(10, 10, 15, 0.4)",
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {isDirty && (
          <span
            style={{
              color: "#fbbf24",
              fontSize: "0.8rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <WarningOutlined style={{ color: "#fbbf24", fontSize: 16 }} />
            Careful — you have unsaved changes!
          </span>
        )}
      </div>

      <Space size={12}>
        <Button
          type="text"
          onClick={onCancel}
          disabled={isLoading}
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            height: 38,
          }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={onSave}
          loading={isLoading}
          disabled={!isDirty || !isValid || !canManageRules}
          style={{
            background: isDirty && isValid ? "#10b981" : "rgba(16, 185, 129, 0.4)",
            borderColor: isDirty && isValid ? "#10b981" : "rgba(16, 185, 129, 0.1)",
            borderRadius: 8,
            height: 38,
            fontWeight: 600,
          }}
        >
          Save Changes
        </Button>
      </Space>
    </div>
  );
}
