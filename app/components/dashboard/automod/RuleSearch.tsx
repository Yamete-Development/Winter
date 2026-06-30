import { Input, Button } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";

interface RuleSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNewRuleClick: () => void;
  canManageRules: boolean;
}

export function RuleSearch({
  searchQuery,
  onSearchChange,
  onNewRuleClick,
  canManageRules,
}: RuleSearchProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        background: "rgba(10, 10, 15, 0.2)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(8px)",
      }}
    >
      <Input
        prefix={<SearchOutlined style={{ color: "rgba(255, 255, 255, 0.35)" }} />}
        placeholder="Search rules, patterns, whitelists..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          flex: 1,
          background: "rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          color: "#fff",
          borderRadius: 8,
          height: 38,
        }}
        allowClear
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onNewRuleClick}
        disabled={!canManageRules}
        style={{
          background: "#8b5cf6",
          borderColor: "#8b5cf6",
          borderRadius: 8,
          height: 38,
          fontWeight: 600,
        }}
      >
        New Rule
      </Button>
    </div>
  );
}
