import type { Route } from "./+types/index";
import { useEffect, useState, useMemo } from "react";
import { Col, Row, Tabs, Spin } from "antd";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { orpc } from "../../lib/orpc";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { AntiSwearRule } from "../../components/BlockedWordsManager";
import { CreateHubWizard } from "../../components/CreateHubWizard";
import { EmptyDashboardState } from "../../components/dashboard/EmptyDashboardState";
import { GeneralTab } from "../../components/dashboard/GeneralTab";
import { HubSelector } from "../../components/dashboard/HubSelector";
import { defaultDashboardLayouts, mockFallbackHub } from "../../components/dashboard/mockData";
import { ModerationTab } from "../../components/dashboard/ModerationTab";
import { DashboardPageHeader } from "../../components/dashboard/PageHeader";
import type { DashboardLayouts, DashboardHub, DashboardHubConfig } from "../../components/dashboard/types";
import { type LinksFunction, useRevalidator } from "react-router";
import gridStyles from "react-grid-layout/css/styles.css?url";
import resizableStyles from "react-resizable/css/styles.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: gridStyles },
  { rel: "stylesheet", href: resizableStyles }
];

export default function DashboardIndex({ }: Route.ComponentProps) {
  const { revalidate } = useRevalidator();
  const { data: userHubs, isLoading } = useQuery(orpc.hub.getUserHubs.queryOptions());

  const hubsList = userHubs || [];
  const isFirstHub = hubsList.length === 0;

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedHubId, setSelectedHubId] = useState("");
  const [activeTab, setActiveTab] = useState<'moderation' | 'general'>('moderation');
  const [tabAnimKey, setTabAnimKey] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [layouts, setLayouts] = useState<DashboardLayouts>(defaultDashboardLayouts);

  // Fetch real data for the active hub
  const { data: connectionsData } = useQuery(
    orpc.hub.getConnections.queryOptions({
      input: { hubId: selectedHubId }, 
      enabled: !!selectedHubId
    })
  );
  
  const { data: rulesData } = useQuery(
    orpc.moderation.getAntiSwearRules.queryOptions({
      input: { hubId: selectedHubId }, 
      enabled: !!selectedHubId
    })
  );

  const queryClient = useQueryClient();

  const { data: messagesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    orpc.hub.getRecentMessages.infiniteOptions({
      input: (pageParam: string | undefined) => ({ hubId: selectedHubId, limit: 50, cursor: pageParam }), 
      enabled: !!selectedHubId,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: undefined as string | undefined
    })
  );

  useEffect(() => {
    if (!selectedHubId) return;

    const abortController = new AbortController();

    const connectSse = async () => {
      try {
        const tokenRes = await fetch(`/api/v1/auth/sse?hubId=${selectedHubId}`);
        if (!tokenRes.ok) {
          throw new Error("Failed to fetch SSE token");
        }
        const { token } = await tokenRes.json();

        await fetchEventSource(`http://localhost:4000/${selectedHubId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          signal: abortController.signal,
          onmessage(event) {
            if (event.event === "ping") return;
            try {
              const payload = JSON.parse(event.data);
              const newMessage = {
                metadata: {
                  id: payload.id,
                  name: `Message-${payload.id}`,
                  createdAt: payload.createdAt,
                  updatedAt: payload.createdAt,
                },
                spec: {
                  content: payload.content,
                  authorId: payload.authorId,
                  guildId: payload.guildId,
                  imageUrl: null,
                },
                status: {
                  authorName: payload.authorName,
                  guildName: payload.guildName,
                  badges: payload.badges || [],
                }
              };

              const queryKey = orpc.hub.getRecentMessages.key({ input: { hubId: selectedHubId, limit: 50 } });
              queryClient.setQueriesData({ queryKey }, (oldData: any) => {
                if (!oldData || !oldData.pages) return oldData;
                const firstPage = oldData.pages[0];
                const newFirstPage = { ...firstPage, items: [newMessage, ...firstPage.items] };
                return { ...oldData, pages: [newFirstPage, ...oldData.pages.slice(1)] };
              });
            } catch (e) {
              console.error("Failed to parse SSE payload", e);
            }
          },
          onerror(err) {
            console.error("SSE connection error", err);
            // Throw to allow fetchEventSource to retry if necessary
            throw err;
          }
        });
      } catch (err) {
        console.error("SSE setup failed", err);
      }
    };

    connectSse();

    return () => {
      abortController.abort();
    };
  }, [selectedHubId, queryClient]);

  useEffect(() => {
    const saved = localStorage.getItem("interchat-dashboard-layout");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.moderation && parsed.general) {
          setLayouts(parsed);
        }
      } catch (e) {
        console.error("Failed to parse layout from local storage");
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoading && hubsList.length === 0) {
      setShowOnboarding(true);
    }
    if (!selectedHubId && hubsList.length > 0) {
      setSelectedHubId(hubsList[0].metadata.id);
    }
  }, [isLoading, hubsList.length, selectedHubId]);

  const handleLayoutChange = (tab: 'moderation' | 'general', newLayout: any, allLayouts: any) => {
    setLayouts(prev => {
      const next = { ...prev, [tab]: allLayouts };
      localStorage.setItem("interchat-dashboard-layout", JSON.stringify(next));
      return next;
    });
  };

  const hubs: DashboardHub[] = hubsList.length > 0 ? hubsList.map(h => ({
    id: h.metadata.id,
    name: h.metadata.name,
    avatarUrl: h.spec.iconUrl || "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=300&auto=format&fit=crop",
    bannerUrl: h.spec.bannerUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    verified: h.status.verified,
    partnered: h.status.partnered,
    weeklyMsgs: h.status.weeklyMessageCount ? h.status.weeklyMessageCount.toString() : "0"
  })) : [];

  const activeHubFull = hubsList.find(h => h.metadata.id === selectedHubId);
  const activeHub = hubs.find(h => h.id === selectedHubId) || hubs[0] || mockFallbackHub;

  // Construct live config from fetched resources
  const activeConfig: DashboardHubConfig = useMemo(() => {
    return {
      nsfw: activeHubFull?.spec.nsfw || false,
      locked: activeHubFull?.spec.locked || false,
      profanityFilter: rulesData ? rulesData.length > 0 : false,
      appealCooldown: activeHubFull?.spec.appealCooldownHours || 168,
      welcomeMessage: activeHubFull?.spec.welcomeMessage || "",
      antiSwearRules: rulesData ? rulesData.map(r => ({
        id: r.metadata.id,
        pattern: r.spec.patterns[0]?.pattern || r.spec.name,
        matchType: (r.spec.patterns[0]?.matchType?.toLowerCase() as any) || "wildcard",
        actions: r.spec.actions
      })) : [],
      connections: connectionsData ? connectionsData.map(c => ({
        name: c.status.serverName,
        channel: c.status.channelName || `#${c.spec.channelId}`,
        connected: c.spec.connected
      })).sort((a, b) => a.name.localeCompare(b.name)) : [],
      chatLogs: messagesData?.pages.flatMap(page => page.items).map(m => ({
        id: m.metadata.id,
        sender: m.status.authorName || "Unknown",
        origin: m.status.guildName || "Unknown",
        text: m.spec.content,
        badge: m.status.badges[0] || "",
        createdAt: m.metadata.createdAt
      })) || [],
      permissions: activeHubFull?.metadata.permissions || {
        MANAGE_HUB_SETTINGS: false,
        MANAGE_CONNECTIONS: false,
        MANAGE_MODERATORS: false,
        MANAGE_RULES: false,
        MODERATE_MESSAGES: false,
        VIEW_ANALYTICS: false,
        VIEW_LOGS: false,
      },
      effectiveRole: activeHubFull?.metadata.effectiveRole || "NONE",
    };
  }, [activeHubFull, connectionsData, rulesData, messagesData]);

  // Mutation handlers are no-ops for now, will be implemented in future phase
  const handleToggleConfig = () => console.log("Mutations not yet hooked up");
  const handleNumberConfigChange = () => console.log("Mutations not yet hooked up");
  const handleTextConfigChange = () => console.log("Mutations not yet hooked up");
  const handleToggleConnection = () => console.log("Mutations not yet hooked up");
  const handleDisconnectConnection = () => console.log("Mutations not yet hooked up");
  const handleAddConnection = () => console.log("Mutations not yet hooked up");
  const handleAddAntiSwearRule = () => console.log("Mutations not yet hooked up");
  const handleRemoveAntiSwearRule = () => console.log("Mutations not yet hooked up");
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    console.log("Chat sending not yet hooked up");
    setChatInput("");
  };

  // Provide a dummy configs record for the HubSelector since it expects one
  const dummyConfigs = { [selectedHubId]: activeConfig };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Row gutter={[24, 24]} style={{ height: '100%' }}>
        <HubSelector hubs={hubs} configs={dummyConfigs as any} selectedHubId={selectedHubId} onSelectHub={setSelectedHubId} onCreateHub={() => setShowOnboarding(true)} />
        <Col xs={24} lg={18} style={{ paddingTop: 24, height: '100%', overflowY: 'auto', paddingRight: 12, position: 'relative' }} className="dark-scrollbar">
          <div style={hubs.length === 0 ? { filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.3, transition: 'all 0.3s ease' } : { transition: 'all 0.3s ease' }}>
            <DashboardPageHeader activeHub={activeHub} />
          <Tabs 
            activeKey={activeTab}
            destroyInactiveTabPane={true}
            onChange={key => { setActiveTab(key as 'moderation' | 'general'); setTabAnimKey(k => k + 1); }}
            items={[
              {
                key: 'moderation',
                label: <span style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.02em', padding: '0 8px' }}>Moderation & Safety</span>,
                children: (
                  <ModerationTab
                    activeTab={activeTab}
                    tabAnimKey={tabAnimKey}
                    layout={layouts.moderation}
                    onLayoutChange={(layout, allLayouts) => handleLayoutChange('moderation', layout, allLayouts)}
                    activeHub={activeHub}
                    activeConfig={activeConfig}
                    chatInput={chatInput}
                    onChatInputChange={setChatInput}
                    onSendChat={handleSendChat}
                    onToggleConfig={handleToggleConfig}
                    onAppealCooldownChange={(value) => handleNumberConfigChange()}
                    onAddAntiSwearRule={handleAddAntiSwearRule}
                    onRemoveAntiSwearRule={handleRemoveAntiSwearRule}
                    fetchNextPage={fetchNextPage}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                  />
                )
              },
              {
                key: 'general',
                label: <span style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.02em', padding: '0 8px' }}>General Settings</span>,
                children: (
                  <GeneralTab
                    activeTab={activeTab}
                    tabAnimKey={tabAnimKey}
                    layout={layouts.general}
                    onLayoutChange={(layout, allLayouts) => handleLayoutChange('general', layout, allLayouts)}
                    activeConfig={activeConfig}
                    onAddConnection={handleAddConnection}
                    onToggleConnection={handleToggleConnection}
                    onDisconnectConnection={handleDisconnectConnection}
                    onWelcomeMessageChange={(value) => handleTextConfigChange()}
                  />
                )
              }
            ]}
          />
          </div>
          {hubs.length === 0 && (
            <EmptyDashboardState onCreateHub={() => setShowOnboarding(true)} />
          )}
        </Col>

      </Row>

      <CreateHubWizard
        mode="modal"
        open={showOnboarding}
        isFirstHub={isFirstHub}
        onCancel={() => setShowOnboarding(false)}
        onCreated={() => {
          revalidate();
          setShowOnboarding(false);
        }}
      />
    </div>
  );
}
