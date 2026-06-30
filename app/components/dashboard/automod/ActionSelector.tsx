import { Select, InputNumber, Typography, Space } from "antd";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";

const { Text } = Typography;

interface ActionSelectorProps {
  actions: string[];
  muteDurationMinutes: number | null;
  onActionsChange: (actions: string[]) => void;
  onMuteDurationChange: (duration: number | null) => void;
  disabled: boolean;
}

export function ActionSelector({
  actions,
  muteDurationMinutes,
  onActionsChange,
  onMuteDurationChange,
  disabled,
}: ActionSelectorProps) {
  const showMuteDuration = actions.includes("MUTE");

  // Options matching the required categories and action names
  const selectOptions = [
    {
      label: "Message Actions",
      options: [
        {
          value: "BLOCK_MESSAGE",
          label: "Block Message",
          desc: "Deletes the message so no one else sees it.",
        },
        {
          value: "CENSOR_WORD",
          label: "Censor Word",
          desc: "Replaces the blocked pattern with asterisks (e.g. c***r).",
        },
      ],
    },
    {
      label: "Moderation",
      options: [
        {
          value: "WARN",
          label: "Warn User",
          desc: "Issues an official warning and logs it in infractions.",
        },
        {
          value: "MUTE",
          label: "Mute User",
          desc: "Temporarily times out the user from sending messages.",
        },
        {
          value: "BAN",
          label: "Ban User",
          desc: "Bans the user permanently from the server.",
        },
      ],
    },
    {
      label: "Notifications",
      options: [
        {
          value: "SEND_ALERT",
          label: "Send Mod Alert",
          desc: "Sends a notification about the violation to the moderators.",
        },
      ],
    },
  ];

  const handleActionsChange = (newActions: string[]) => {
    onActionsChange(newActions);
    if (newActions.includes("MUTE") && !muteDurationMinutes) {
      onMuteDurationChange(10); // default to 10 minutes
    } else if (!newActions.includes("MUTE")) {
      onMuteDurationChange(null);
    }
  };

  const optionRender = (option: any) => {
    const rawOption = option.data;
    if (!rawOption.desc) return option.label;
    return (
      <div style={{ padding: "4px 0" }}>
        <div style={{ color: "#fff", fontWeight: 500, fontSize: "0.85rem" }}>
          {rawOption.label}
        </div>
        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", whiteSpace: "normal" }}>
          {rawOption.desc}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Text style={{ display: "block", color: "#fff", fontWeight: 600, fontSize: "0.9rem", marginBottom: 4 }}>
          Automated Actions
        </Text>
        <Text type="secondary" style={{ fontSize: "0.8rem", display: "block", marginBottom: 8 }}>
          Select the actions to execute automatically when a pattern is matched.
        </Text>
      </div>

      <Select
        mode="multiple"
        showSearch
        style={{ width: "100%" }}
        placeholder="Select actions..."
        value={actions}
        onChange={handleActionsChange}
        disabled={disabled}
        options={selectOptions}
        filterOption={(input, option) => {
          const optLabel = typeof (option as any)?.label === "string" ? (option as any).label : "";
          const optDesc = (option as any)?.desc || "";
          return (
            optLabel.toLowerCase().includes(input.toLowerCase()) ||
            optDesc.toLowerCase().includes(input.toLowerCase())
          );
        }}
        optionRender={optionRender}
        popupClassName="dark-select-popup"
      />

      {showMuteDuration && (
        <div
          style={{
            marginTop: 4,
            padding: 12,
            borderRadius: 8,
            background: "rgba(139, 92, 246, 0.05)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div>
            <Text style={{ display: "block", color: "#fff", fontWeight: 600, fontSize: "0.8rem" }}>
              Mute Duration
            </Text>
            <Text type="secondary" style={{ fontSize: "0.75rem", display: "block" }}>
              Specify the timeout duration for the user (in minutes).
            </Text>
          </div>
          <InputNumber
            min={1}
            max={43200} // 30 days max
            value={muteDurationMinutes || 10}
            onChange={(val) => onMuteDurationChange(val ? Number(val) : null)}
            disabled={disabled}
            style={{
              width: "120px",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#fff",
              borderRadius: 6,
            }}
          />
        </div>
      )}
    </div>
  );
}
