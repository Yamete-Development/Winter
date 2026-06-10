import { CaretRightOutlined, DisconnectOutlined, PauseOutlined, PlusOutlined } from "@ant-design/icons";
import { Badge, Button, Col, Input, Row, Space, Typography } from "antd";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { GridItemWrapper, GridTabContent } from "./GridTabContent";
import { DashboardDangerCard, DashboardSectionCard, DashboardSectionTitle } from "./shared";
import type { DashboardHubConfig, DashboardTabKey } from "./types";

const { Text } = Typography;

type GeneralTabProps = {
  activeTab: DashboardTabKey;
  tabAnimKey: number;
  layout: any;
  onLayoutChange: (layout: any, allLayouts: any) => void;
  activeConfig: DashboardHubConfig;
  onAddConnection: () => void;
  onToggleConnection: (guildName: string) => void;
  onDisconnectConnection: (guildName: string) => void;
  onWelcomeMessageChange: (value: string) => void;
};

export function GeneralTab({
  activeTab,
  tabAnimKey,
  layout,
  onLayoutChange,
  activeConfig,
  onAddConnection,
  onToggleConnection,
  onDisconnectConnection,
  onWelcomeMessageChange,
}: GeneralTabProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: activeConfig.connections.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5,
    getItemKey: (index) => `${activeConfig.connections[index].name}-${index}`,
  });

  return (
    <div key={activeTab === "general" ? tabAnimKey : undefined} className="tab-content-enter">
      <GridTabContent layout={layout} onLayoutChange={onLayoutChange}>
        <GridItemWrapper key="connections">
          <DashboardSectionCard
            title={<DashboardSectionTitle>Connected Discord Guilds ({activeConfig.connections.length})</DashboardSectionTitle>}
            extra={<Button type="link" icon={<PlusOutlined />} onClick={onAddConnection} style={{ color: activeConfig.permissions.MANAGE_CONNECTIONS ? "#a78bfa" : "rgba(255,255,255,0.25)", paddingRight: 24 }} disabled={!activeConfig.permissions.MANAGE_CONNECTIONS}>Connect Guild</Button>}
            styles={{ body: { padding: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" } }}
          >
            <div ref={parentRef} className="dark-scrollbar" style={{ padding: "16px 20px", flex: 1, overflowY: "auto" }}>
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const connection = activeConfig.connections[virtualRow.index];
                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                        paddingBottom: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <Badge status={connection.connected ? "success" : "default"} style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text strong style={{ color: "white", display: "block" }}>
                            {connection.name}
                          </Text>
                          <Text type="secondary" style={{ fontSize: "0.75rem" }}>
                            Channel: {connection.channel}
                          </Text>
                        </div>
                        <Space size={8} style={{ flexShrink: 0 }}>
                          <Button size="small" style={{ background: "transparent", borderColor: "rgba(255,255,255,0.1)" }} icon={connection.connected ? <PauseOutlined /> : <CaretRightOutlined />} onClick={() => onToggleConnection(connection.name)} disabled={!activeConfig.permissions.MANAGE_CONNECTIONS}>
                            {connection.connected ? "Pause" : "Resume"}
                          </Button>
                          <Button danger size="small" type="text" style={{ background: "rgba(245, 34, 45, 0.1)" }} icon={<DisconnectOutlined />} onClick={() => onDisconnectConnection(connection.name)} disabled={!activeConfig.permissions.MANAGE_CONNECTIONS}>
                            Disconnect
                          </Button>
                        </Space>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DashboardSectionCard>
        </GridItemWrapper>

        <GridItemWrapper key="profile">
          <DashboardSectionCard title={<DashboardSectionTitle>Hub Profile & Settings</DashboardSectionTitle>}>
            <Text strong style={{ color: "white" }}>
              Global Welcome message
            </Text>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", margin: "4px 0 12px" }}>
              Welcoming text sent when a Discord server binds to this Hub.
            </p>
            <Input.TextArea rows={3} value={activeConfig.welcomeMessage} onChange={(event) => onWelcomeMessageChange(event.target.value)} style={{ marginBottom: 32, background: "rgba(0,0,0,0.3)", border: "1px solid #2d2d34", resize: "none" }} disabled={!activeConfig.permissions.MANAGE_HUB_SETTINGS} />

            <Row gutter={16}>
              <Col span={12}>
                <Text strong style={{ fontSize: "0.8rem", color: "white" }}>
                  Language
                </Text>
                <Input value="English" readOnly style={{ width: "100", marginTop: 8, background: "rgba(0,0,0,0.3)", border: "1px solid #2d2d34" }} />
              </Col>
              <Col span={12}>
                <Text strong style={{ fontSize: "0.8rem", color: "white" }}>
                  Region
                </Text>
                <Input value="North America" readOnly style={{ width: "100", marginTop: 8, background: "rgba(0,0,0,0.3)", border: "1px solid #2d2d34" }} />
              </Col>
            </Row>
          </DashboardSectionCard>
        </GridItemWrapper>

        <GridItemWrapper key="dangerZone">
          <DashboardDangerCard title={<Text style={{ color: "#ff4d4f", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Danger Zone</Text>}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(245, 34, 45, 0.1)" }}>
              <div>
                <Text strong style={{ color: "white", display: "block" }}>
                  Transfer Ownership
                </Text>
                <Text type="secondary" style={{ fontSize: "0.75rem" }}>
                  Transfer this hub to another server.
                </Text>
              </div>
              <Button danger ghost disabled={activeConfig.effectiveRole !== "OWNER"}>
                Transfer
              </Button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text strong style={{ color: "white", display: "block" }}>
                  Delete Hub
                </Text>
                <Text type="secondary" style={{ fontSize: "0.75rem" }}>
                  Permanently destroy this hub.
                </Text>
              </div>
              <Button danger type="primary" style={{ background: activeConfig.effectiveRole === "OWNER" ? "#f5222d" : undefined, borderColor: activeConfig.effectiveRole === "OWNER" ? "#f5222d" : undefined }} disabled={activeConfig.effectiveRole !== "OWNER"}>
                Delete Hub
              </Button>
            </div>
          </DashboardDangerCard>
        </GridItemWrapper>
      </GridTabContent>
    </div>
  );
}