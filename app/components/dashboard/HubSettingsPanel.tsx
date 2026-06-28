import { Divider, Switch, Typography } from "antd";
import { DashboardSectionCard, DashboardSectionTitle } from "./shared";
import { HubSettingsFlags, hasSettingsFlag } from "../../schemas/hub";
import type { DashboardHubConfig } from "./types";

const { Text } = Typography;

const SETTINGS_TOGGLES: { flag: keyof typeof HubSettingsFlags; label: string; desc: string }[] = [
  { flag: "REACTIONS", label: "Allow Reactions", desc: "Enable cross-server emoji reactions on messages." },
  { flag: "HIDE_LINKS", label: "Hide Links", desc: "Block all URLs and links from being forwarded." },
  { flag: "SPAM_FILTER", label: "Spam Filter", desc: "Automatically block repeated messages and spam." },
  { flag: "BLOCK_INVITES", label: "Block Invites", desc: "Prevent Discord server invite links in messages." },
  { flag: "USE_NICKNAMES", label: "Use Nicknames", desc: "Forward messages with server nicknames instead of usernames." },
  { flag: "BLOCK_NSFW", label: "Block NSFW Images", desc: "Block explicit images using ML-based detection." },
  { flag: "ALLOW_VIDEOS", label: "Allow Videos", desc: "Forward video attachments across connected servers." },
  { flag: "BLOCK_ATTACHMENTS", label: "Block Attachments", desc: "Prevent file attachments from being forwarded." },
  { flag: "BLOCK_TENOR_GIFS", label: "Block Tenor GIFs", desc: "Prevent Tenor GIF links from being sent." },
];

type HubSettingsPanelProps = {
  activeConfig: DashboardHubConfig;
  onToggleFlag: (flag: string, enabled: boolean) => void;
};

export function HubSettingsPanel({ activeConfig, onToggleFlag }: HubSettingsPanelProps) {
  const canEdit = activeConfig.permissions.MANAGE_HUB_SETTINGS;

  return (
    <DashboardSectionCard title={<DashboardSectionTitle>Hub Settings</DashboardSectionTitle>}>
      {SETTINGS_TOGGLES.map(({ flag, label, desc }) => (
        <div
          key={flag}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0",
            borderBottom: "1px solid rgba(255,255,255,0.03)",
          }}
        >
          <div>
            <Text strong style={{ color: "white", display: "block" }}>
              {label}
            </Text>
            <Text type="secondary" style={{ fontSize: "0.75rem" }}>
              {desc}
            </Text>
          </div>
          <Switch
            checked={hasSettingsFlag(activeConfig.settings, flag)}
            onChange={(checked) => onToggleFlag(flag, checked)}
            style={{
              background: hasSettingsFlag(activeConfig.settings, flag) ? "#9146ff" : "rgba(255,255,255,0.2)",
            }}
            disabled={!canEdit}
          />
        </div>
      ))}
    </DashboardSectionCard>
  );
}
