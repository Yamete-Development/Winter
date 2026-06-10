import { useEffect, useRef, useMemo, useLayoutEffect, useState } from "react";
import { CrownFilled, PlusOutlined, SafetyCertificateFilled, LoadingOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Divider, Dropdown, Input, Space, Switch, Tag, Typography, message, Spin, Segmented, Skeleton } from "antd";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import type { AntiSwearRule } from "../BlockedWordsManager";
import { BlockedWordsManager } from "../BlockedWordsManager";
import { GridItemWrapper, GridTabContent } from "./GridTabContent";
import { DashboardSectionCard, DashboardSectionTitle } from "./shared";
import type { DashboardHub, DashboardHubConfig, DashboardTabKey } from "./types";
import { orpc } from "../../lib/orpc";
import { useQuery } from "@tanstack/react-query";
import type { InfractionResource } from "../../resources/moderation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const moderationToggles = [
  { label: "Global NSFW Block", desc: "Block explicit media and NSFW content.", field: "nsfw" as const },
  { label: "Broadcast Lock", desc: "Freeze chat forwarding across all guilds.", field: "locked" as const },
  { label: "Anti-Swear Rules", desc: "Automatically censor profanities and offensive text.", field: "profanityFilter" as const },
];

const mockStaff = [
  { user: "Kummerfeldt", role: "OWNER", avatar: "K" },
  { user: "xX_Slayer_Xx", role: "MANAGER", avatar: "X" },
  { user: "AliceInCode", role: "MODERATOR", avatar: "A" },
];

type ModerationTabProps = {
  activeTab: DashboardTabKey;
  tabAnimKey: number;
  layout: any;
  onLayoutChange: (layout: any, allLayouts: any) => void;
  activeHub: DashboardHub;
  activeConfig: DashboardHubConfig;
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendChat: () => void;
  onToggleConfig: (field: "nsfw" | "locked" | "profanityFilter") => void;
  onAppealCooldownChange: (value: number) => void;
  onAddAntiSwearRule: (rule: AntiSwearRule) => void;
  onRemoveAntiSwearRule: (id: string) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

export function ModerationTab({
  activeTab,
  tabAnimKey,
  layout,
  onLayoutChange,
  activeHub,
  activeConfig,
  chatInput,
  onChatInputChange,
  onSendChat,
  onToggleConfig,
  onAppealCooldownChange,
  onAddAntiSwearRule,
  onRemoveAntiSwearRule,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: ModerationTabProps) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [infractionTab, setInfractionTab] = useState<"USER" | "SERVER">("USER");

  const infractionsQuery = useQuery(orpc.moderation.getRecentInfractions.queryOptions({ 
    input: { hubId: activeHub.id }
  }));

  const infractions = (infractionsQuery.data || []) as InfractionResource[];
  const filteredInfractions = infractions.filter((inf: InfractionResource) => inf.spec.targetType === infractionTab);

  const reversedLogs = useMemo(() => {
    return [...activeConfig.chatLogs].reverse();
  }, [activeConfig.chatLogs]);

  useEffect(() => {
    if (reversedLogs.length > 0 && isInitialLoad) {
      const timer = setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({ index: 'LAST', align: 'end' });
        setIsInitialLoad(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [reversedLogs.length, isInitialLoad]);

  return (
    <div key={activeTab === "moderation" ? tabAnimKey : undefined} className="tab-content-enter">
      <GridTabContent layout={layout} onLayoutChange={onLayoutChange}>
        <GridItemWrapper key="liveFeed">
          <DashboardSectionCard styles={{ body: { padding: 0, display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" } }}>
            <div style={{ height: 120, flexShrink: 0, position: "relative", background: `linear-gradient(to top, rgba(14,14,17,1) 0%, rgba(14,14,17,0.4) 100%), url('${activeHub.bannerUrl}') center/cover` }}>
              <div style={{ position: "absolute", bottom: -16, left: 20, display: "flex", alignItems: "flex-end", gap: 16 }}>
                <Avatar shape="square" size={64} src={activeHub.avatarUrl} style={{ borderRadius: 14, border: "3px solid #0e0e11", background: "rgba(0,0,0,0.5)" }} />
                <div style={{ paddingBottom: 18 }}>
                  <Title level={4} style={{ margin: 0, color: "white", lineHeight: 1, paddingRight: 32 }}>
                    {activeHub.name}
                  </Title>
                  <Space size="small" style={{ marginTop: 8 }}>
                    {activeHub.verified && <Tag color="blue" variant="filled" icon={<SafetyCertificateFilled />}>Verified</Tag>}
                    {activeHub.partnered && <Tag color="gold" variant="filled" icon={<CrownFilled />}>Partner</Tag>}
                  </Space>
                </div>
              </div>
            </div>

            <div style={{ padding: "36px 20px 20px", background: "rgba(0,0,0,0.3)", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center", flexShrink: 0 }}>
                <Text strong style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Hub Live Feed
                </Text>
                <Badge status="processing" text={<span style={{ color: "#4ade80", fontSize: "0.75rem", fontWeight: 600 }}>MONITORING</span>} color="#4ade80" />
              </div>
              <div className="dark-scrollbar" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Virtuoso
                  ref={virtuosoRef}
                  style={{ flex: 1 }}
                  data={reversedLogs}
                  firstItemIndex={1000000 - reversedLogs.length}
                  startReached={() => {
                    if (hasNextPage && !isFetchingNextPage && !isInitialLoad) {
                      fetchNextPage();
                    }
                  }}
                  alignToBottom={true}
                  followOutput={"smooth"}
                  components={{
                    Header: () => (
                      <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
                        {hasNextPage ? <Spin size="small" /> : <span style={{ color: "#71717a", fontSize: "0.875rem" }}>No more messages</span>}
                      </div>
                    )
                  }}
                  itemContent={(index, messageItem) => (
                    <div style={{ paddingBottom: "16px", paddingRight: "8px" }}>
                      <div style={{ display: "flex", gap: 12, padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <Dropdown
                          menu={{
                            items: [
                              { key: "warn", label: "Issue Warning" },
                              { key: "mute", label: "Mute User", danger: true },
                              { type: "divider" },
                              { key: "ban", label: "Ban from Hub", danger: true },
                            ],
                            onClick: (event) => message.success(`Action '${event.key}' queued for ${messageItem.sender}`),
                          }}
                          trigger={["click"]}
                          placement="bottomLeft"
                        >
                          <Avatar src={messageItem.avatarUrl} style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", flexShrink: 0, cursor: "pointer", transition: "all 0.2s" }} className="hover:scale-105">
                            {messageItem.sender.substring(0, 2).toUpperCase()}
                          </Avatar>
                        </Dropdown>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Text strong style={{ color: messageItem.badge === "OWNER" ? "#fadb14" : messageItem.badge === "MOD" ? "#a78bfa" : "white" }}>
                              {messageItem.sender}
                            </Text>
                            {messageItem.badge === "MOD" && <Tag color="purple" variant="filled" style={{ margin: 0, fontSize: "0.6rem", padding: "0 4px", lineHeight: "16px" }}>MOD</Tag>}
                            {messageItem.badge === "VIP" && <Tag color="cyan" variant="filled" style={{ margin: 0, fontSize: "0.6rem", padding: "0 4px", lineHeight: "16px" }}>VIP</Tag>}
                            {messageItem.badge === "OWNER" && <Tag color="gold" variant="filled" style={{ margin: 0, fontSize: "0.6rem", padding: "0 4px", lineHeight: "16px" }}>OWNER</Tag>}
                            <Text type="secondary" style={{ fontSize: "0.7rem", marginLeft: 4 }}>
                              <span suppressHydrationWarning>
                                {messageItem.createdAt ? new Date(messageItem.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : "Unknown Time"}
                              </span>
                            </Text>
                          </div>
                          <Text style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>
                            {messageItem.text}
                          </Text>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>

            <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.4)", flexShrink: 0 }}>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  placeholder="Inject mock chat message into the global hub..."
                  value={chatInput}
                  onChange={(event) => onChatInputChange(event.target.value)}
                  onPressEnter={onSendChat}
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #2d2d34" }}
                  disabled={!activeConfig.permissions.MODERATE_MESSAGES}
                />
                <Button type="primary" onClick={onSendChat} style={{ background: activeConfig.permissions.MODERATE_MESSAGES ? "#9146ff" : "rgba(255,255,255,0.2)", border: activeConfig.permissions.MODERATE_MESSAGES ? "1px solid #9146ff" : "none", boxShadow: "none" }} disabled={!activeConfig.permissions.MODERATE_MESSAGES}>
                  Send
                </Button>
              </Space.Compact>
            </div>
          </DashboardSectionCard>
        </GridItemWrapper>

        <GridItemWrapper key="safetyKnobs">
          <DashboardSectionCard title={<DashboardSectionTitle>Hub Safety Knobs</DashboardSectionTitle>}>
            <div style={{ marginBottom: 16 }}>
              {moderationToggles.map(({ label, desc, field }) => (
                <div key={field} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div>
                    <Text strong style={{ color: "white", display: "block" }}>
                      {label}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "0.75rem" }}>
                      {desc}
                    </Text>
                  </div>
                  <Switch checked={activeConfig[field]} onChange={() => onToggleConfig(field)} style={{ background: activeConfig[field] ? "#9146ff" : "rgba(255,255,255,0.2)" }} disabled={!activeConfig.permissions.MANAGE_HUB_SETTINGS} />
                </div>
              ))}
            </div>
            <Divider style={{ margin: "0 0 16px 0", borderColor: "rgba(255,255,255,0.05)" }} />
            <div>
              <Text strong style={{ color: "white" }}>
                Appeal Cooldown Period (Hours)
              </Text>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", margin: "4px 0 12px" }}>
                Hours before banned servers can appeal infractions.
              </p>
              <Input type="number" value={activeConfig.appealCooldown} onChange={(event) => onAppealCooldownChange(parseInt(event.target.value, 10))} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #2d2d34" }} disabled={!activeConfig.permissions.MANAGE_HUB_SETTINGS} />
            </div>
          </DashboardSectionCard>
        </GridItemWrapper>

        <GridItemWrapper key="blockedWords">
          <DashboardSectionCard title={<DashboardSectionTitle>Automod: Blocked Words</DashboardSectionTitle>}>
            <div style={!activeConfig.permissions.MANAGE_RULES ? { pointerEvents: "none", opacity: 0.6 } : {}}>
              <BlockedWordsManager rules={activeConfig.antiSwearRules} onAddRule={onAddAntiSwearRule} onRemoveRule={onRemoveAntiSwearRule} />
            </div>
          </DashboardSectionCard>
        </GridItemWrapper>

        <GridItemWrapper key="infractions">
          <DashboardSectionCard title={<DashboardSectionTitle>Recent Infractions</DashboardSectionTitle>} styles={{ body: { padding: "12px 20px", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" } }}>
            <div style={{ marginBottom: 16 }}>
              <Segmented
                options={[
                  { label: "Users", value: "USER" },
                  { label: "Servers", value: "SERVER" }
                ]}
                value={infractionTab}
                onChange={(val) => setInfractionTab(val as "USER" | "SERVER")}
                block
                style={{ background: "rgba(0,0,0,0.3)" }}
              />
            </div>
            <div className="dark-scrollbar" style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
              {infractionsQuery.isLoading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : filteredInfractions.length === 0 ? (
                <Text type="secondary" style={{ textAlign: "center", display: "block", marginTop: 20 }}>No recent infractions found.</Text>
              ) : (
                filteredInfractions.map((item: InfractionResource) => (
                  <div key={item.metadata.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <Avatar 
                      src={item.status.targetAvatarUrl}
                      style={{ 
                        background: item.spec.type === "BAN" || item.spec.type === "BLACKLIST" ? "rgba(245, 34, 45, 0.2)" : item.spec.type === "MUTE" ? "rgba(250, 173, 20, 0.2)" : "rgba(22, 119, 255, 0.2)", 
                        color: item.spec.type === "BAN" || item.spec.type === "BLACKLIST" ? "#f5222d" : item.spec.type === "MUTE" ? "#faad14" : "#1677ff", 
                        flexShrink: 0 
                      }}
                    >
                      {item.status.targetName?.[0]?.toUpperCase() || "?"}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Space size={6} wrap>
                        <Text strong style={{ color: "white" }} ellipsis>
                          {item.status.targetName || "Unknown"}
                        </Text>
                        <Tag 
                          color={item.spec.type === "BAN" || item.spec.type === "BLACKLIST" ? "red" : item.spec.type === "MUTE" ? "warning" : "processing"} 
                          variant="filled" 
                          style={{ margin: 0, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                          {item.spec.type}
                        </Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: "0.8rem", display: "block" }}>
                        {item.spec.reason} • {dayjs(item.metadata.createdAt).fromNow()}
                      </Text>
                    </div>
                    <Button size="small" type="text" danger={item.status.status === "ACTIVE"} disabled={item.status.status !== "ACTIVE" || !activeConfig.permissions.MODERATE_MESSAGES} style={{ background: item.status.status === "ACTIVE" && activeConfig.permissions.MODERATE_MESSAGES ? "rgba(245, 34, 45, 0.1)" : "transparent", border: item.status.status === "ACTIVE" && activeConfig.permissions.MODERATE_MESSAGES ? "1px solid rgba(245, 34, 45, 0.2)" : "none", flexShrink: 0 }}>
                      {item.status.status === "ACTIVE" ? "Revoke" : "Expired"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DashboardSectionCard>
        </GridItemWrapper>

        <GridItemWrapper key="staff">
          <DashboardSectionCard
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 24 }}>
                <DashboardSectionTitle>Staff Management</DashboardSectionTitle>
                <Button type="primary" size="small" icon={<PlusOutlined />} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, fontWeight: 600 }} disabled={!activeConfig.permissions.MANAGE_MODERATORS}>
                  Add Staff
                </Button>
              </div>
            }
            styles={{ header: { borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "12px 20px" }, body: { padding: "12px 20px", flex: 1, overflowY: "auto" } }}
          >
            <div>
              {mockStaff.map((staffMember) => (
                <div key={staffMember.user} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <Avatar style={{ background: "rgba(255,255,255,0.1)", flexShrink: 0 }}>{staffMember.avatar}</Avatar>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ color: "white", display: "block" }}>
                      {staffMember.user}
                    </Text>
                    <Tag color={staffMember.role === "OWNER" ? "gold" : staffMember.role === "MANAGER" ? "cyan" : "purple"} variant="filled" style={{ margin: 0, fontSize: "0.65rem" }}>
                      {staffMember.role}
                    </Tag>
                  </div>
                  <Button size="small" danger type="text" disabled={staffMember.role === "OWNER" || !activeConfig.permissions.MANAGE_MODERATORS} style={{ background: staffMember.role !== "OWNER" && activeConfig.permissions.MANAGE_MODERATORS ? "rgba(245, 34, 45, 0.1)" : "transparent", border: staffMember.role !== "OWNER" && activeConfig.permissions.MANAGE_MODERATORS ? "1px solid rgba(245, 34, 45, 0.2)" : "none", flexShrink: 0 }}>
                    {staffMember.role === "OWNER" ? "Owner" : "Remove"}
                  </Button>
                </div>
              ))}
            </div>
          </DashboardSectionCard>
        </GridItemWrapper>
      </GridTabContent>
    </div>
  );
}