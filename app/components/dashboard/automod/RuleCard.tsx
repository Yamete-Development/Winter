import { Button, Dropdown, Space, Tag } from "antd";
import { MoreOutlined, CopyOutlined, DeleteOutlined, PoweroffOutlined } from "@ant-design/icons";
import type { AutomodRuleResource } from "~/resources/moderation";

interface RuleCardProps {
  rule: AutomodRuleResource;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onToggleEnable: () => void;
  onDelete: () => void;
  canManageRules: boolean;
}

export function RuleCard({
  rule,
  isSelected,
  onSelect,
  onDuplicate,
  onToggleEnable,
  onDelete,
  canManageRules,
}: RuleCardProps) {
  const { name, enabled, patterns, whitelist, actions } = rule.spec;

  const patternCount = rule.status?.patternCount ?? patterns.length;
  const whitelistCount = rule.status?.whitelistCount ?? whitelist.length;

  // Map actions to short, human-readable labels and colors
  const getActionBadge = (action: string) => {
    switch (action) {
      case "BLOCK_MESSAGE":
        return { label: "BLOCK", color: "red" };
      case "CENSOR_WORD":
        return { label: "CENSOR", color: "orange" };
      case "SEND_ALERT":
        return { label: "ALERT", color: "blue" };
      case "WARN":
        return { label: "WARN", color: "gold" };
      case "MUTE":
        return { label: "MUTE", color: "purple" };
      case "BAN":
        return { label: "BAN", color: "volcano" };
      default:
        return { label: action, color: "default" };
    }
  };

  const menuItems = [
    {
      key: "toggle",
      icon: <PoweroffOutlined />,
      label: enabled ? "Disable Rule" : "Enable Rule",
      disabled: !canManageRules,
    },
    {
      key: "duplicate",
      icon: <CopyOutlined />,
      label: "Duplicate Rule",
      disabled: !canManageRules,
    },
    {
      type: "divider" as const,
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete Rule",
      danger: true,
      disabled: !canManageRules,
    },
  ];

  const handleMenuClick = (info: { key: string }) => {
    if (info.key === "toggle") onToggleEnable();
    if (info.key === "duplicate") onDuplicate();
    if (info.key === "delete") onDelete();
  };

  return (
    <div
      onClick={onSelect}
      style={{
        padding: "16px 20px",
        borderRadius: 12,
        background: isSelected
          ? "rgba(139, 92, 246, 0.15)"
          : "rgba(255, 255, 255, 0.02)",
        border: isSelected
          ? "1px solid rgba(139, 92, 246, 0.4)"
          : "1px solid rgba(255, 255, 255, 0.06)",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        opacity: enabled ? 1 : 0.5,
        position: "relative",
      }}
      className="rule-card-hover"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <h4 style={{ margin: 0, color: "#fff", fontSize: "1rem", fontWeight: 600, wordBreak: "break-all", paddingRight: 24 }}>
          {name}
        </h4>
        <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: 12, right: 12 }}>
          <Dropdown
            menu={{ items: menuItems, onClick: handleMenuClick }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ color: "rgba(255,255,255,0.45)" }} />}
              style={{ background: "transparent" }}
            />
          </Dropdown>
        </div>
      </div>

      <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.45)", marginBottom: 12 }}>
        {patternCount > 0 ? `${patternCount} pattern${patternCount === 1 ? "" : "s"}` : "No patterns"}
        {" • "}
        {whitelistCount > 0 ? `${whitelistCount} whitelisted word${whitelistCount === 1 ? "" : "s"}` : "No whitelist"}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {actions.map((act) => {
          const badge = getActionBadge(act);
          return (
            <Tag
              key={act}
              color={badge.color}
              style={{
                margin: 0,
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              {badge.label}
            </Tag>
          );
        })}
        {!enabled && (
          <Tag color="default" style={{ margin: 0, fontSize: "0.7rem", fontWeight: 600 }}>
            DISABLED
          </Tag>
        )}
      </div>
    </div>
  );
}
