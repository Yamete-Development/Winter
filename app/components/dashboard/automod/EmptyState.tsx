import { Button } from "antd";
import { SafetyOutlined, SearchOutlined, InboxOutlined } from "@ant-design/icons";

interface EmptyStateProps {
  type: "NO_RULES" | "NO_RESULTS" | "NO_SELECTION" | "noRules" | "noResults" | "noSelection";
  onNewRuleClick?: () => void;
  canManageRules?: boolean;
}

export function EmptyState({ type, onNewRuleClick, canManageRules }: EmptyStateProps) {
  if (type === "NO_RULES" || type === "noRules") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          textAlign: "center",
          height: "100%",
          minHeight: 300,
        }}
      >
        <SafetyOutlined style={{ fontSize: 48, color: "rgba(255, 255, 255, 0.15)", marginBottom: 16 }} />
        <h3 style={{ color: "#fff", margin: "0 0 8px 0", fontSize: "1.1rem" }}>No AutoMod Rules Yet</h3>
        <p style={{ color: "rgba(255, 255, 255, 0.45)", margin: "0 0 20px 0", maxWidth: 320, fontSize: "0.9rem" }}>
          Create your first rule to automatically moderate messages in this Hub.
        </p>
        {onNewRuleClick && (
          <Button
            type="primary"
            onClick={onNewRuleClick}
            disabled={!canManageRules}
            style={{ background: "#8b5cf6", borderColor: "#8b5cf6", borderRadius: 8, height: 38 }}
          >
            Create First Rule
          </Button>
        )}
      </div>
    );
  }

  if (type === "NO_RESULTS" || type === "noResults") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          textAlign: "center",
          height: "100%",
          minHeight: 200,
        }}
      >
        <SearchOutlined style={{ fontSize: 36, color: "rgba(255, 255, 255, 0.15)", marginBottom: 12 }} />
        <h3 style={{ color: "#fff", margin: "0 0 8px 0", fontSize: "1rem" }}>No Results Found</h3>
        <p style={{ color: "rgba(255, 255, 255, 0.45)", margin: 0, fontSize: "0.85rem" }}>
          Try searching for a different rule name, pattern, or word.
        </p>
      </div>
    );
  }

  // NO_SELECTION
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        textAlign: "center",
        height: "100%",
        minHeight: 400,
      }}
    >
      <InboxOutlined style={{ fontSize: 48, color: "rgba(255, 255, 255, 0.15)", marginBottom: 16 }} />
      <h3 style={{ color: "#fff", margin: "0 0 8px 0", fontSize: "1.1rem" }}>No Rule Selected</h3>
      <p style={{ color: "rgba(255, 255, 255, 0.45)", margin: 0, maxWidth: 300, fontSize: "0.9rem" }}>
        Select a rule from the list on the left to edit its configuration, or create a new one.
      </p>
    </div>
  );
}
