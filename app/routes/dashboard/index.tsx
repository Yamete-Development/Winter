import type { Route } from "./+types/index";
import { useEffect, useState, useMemo } from "react";
import { Col, Row, Tabs, Spin, Modal, message, Input } from "antd";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { orpc } from "../../lib/orpc";
import { getDefaultPermissions } from "../../permissions/config";
import { useQuery, useInfiniteQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { HubSettingsFlags } from "../../schemas/hub";
import type { AutomodRule } from "../../components/BlockedWordsManager";
import { CreateHubWizard } from "../../components/CreateHubWizard";
import { EmptyDashboardState } from "../../components/dashboard/EmptyDashboardState";
import { GeneralTab } from "../../components/dashboard/GeneralTab";
import { HubSelector } from "../../components/dashboard/HubSelector";
import { defaultDashboardLayouts, mockFallbackHub } from "../../components/dashboard/mockData";
import { ModerationTab } from "../../components/dashboard/ModerationTab";
import { DashboardPageHeader } from "../../components/dashboard/PageHeader";
import { UnsavedChangesBanner } from "../../components/dashboard/UnsavedChangesBanner";
import type { DashboardLayouts, DashboardHub, DashboardHubConfig } from "../../components/dashboard/types";
import { type LinksFunction, useRevalidator, useBlocker, useNavigate } from "react-router";
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

  // Unsaved changes state
  const [draftConfig, setDraftConfig] = useState<Partial<DashboardHubConfig>>({});
  const isDirty = Object.keys(draftConfig).length > 0;

  // Route blocking
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // Fetch real data for the active hub
  const { data: connectionsData } = useQuery(
    orpc.hub.getConnections.queryOptions({
      input: { hubId: selectedHubId }, 
      enabled: !!selectedHubId
    })
  );
  
  const { data: rulesData } = useQuery(
    orpc.moderation.getAutomodRules.queryOptions({
      input: { hubId: selectedHubId }, 
      enabled: !!selectedHubId
    })
  );

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutateAsync: patchHubConfig, isPending: isSavingHubConfig } = useMutation(orpc.hub.patchConfig.mutationOptions());
  const { mutateAsync: sendMessageMutation } = useMutation(orpc.hub.sendMessage.mutationOptions());
  const { mutateAsync: toggleConnectionMutation } = useMutation(orpc.hub.toggleConnection.mutationOptions());
  const { mutateAsync: disconnectConnectionMutation } = useMutation(orpc.hub.disconnectConnection.mutationOptions());
  const { mutateAsync: createConnectionMutation } = useMutation(orpc.hub.createConnection.mutationOptions());
  const { mutateAsync: deleteHubMutation } = useMutation(orpc.hub.deleteHub.mutationOptions());
  const { mutateAsync: transferOwnershipMutation } = useMutation(orpc.hub.transferOwnership.mutationOptions());
  const { mutateAsync: nukeMessagesMutation } = useMutation(orpc.hub.nukeMessages.mutationOptions());

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
                  authorAvatarUrl: payload.authorAvatarUrl ? payload.authorAvatarUrl.replace(/\.(png|jpg|jpeg|gif)/i, '.webp') : (payload.authorAvatarHash ? `https://cdn.discordapp.com/avatars/${payload.authorId}/${payload.authorAvatarHash}.webp` : null),
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

  const handleSelectHub = (hubId: string) => {
    if (hubId === selectedHubId) return;
    
    if (isDirty) {
      Modal.confirm({
        title: "Unsaved Changes",
        content: "You have unsaved changes on this hub. Are you sure you want to switch? Your changes will be lost.",
        okText: "Discard Changes",
        okType: "danger",
        cancelText: "Cancel",
        onOk: () => {
          setDraftConfig({});
          setSelectedHubId(hubId);
        }
      });
    } else {
      setSelectedHubId(hubId);
    }
  };

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

  // Construct base server config
  const serverConfig: DashboardHubConfig = useMemo(() => {
    return {
      nsfw: activeHubFull?.spec.nsfw || false,
      locked: activeHubFull?.spec.locked || false,
      profanityFilter: rulesData ? rulesData.length > 0 : false,
      appealCooldown: activeHubFull?.spec.appealCooldownHours || 168,
      welcomeMessage: activeHubFull?.spec.welcomeMessage || "",
      automodRules: rulesData ? rulesData.map(r => ({
        id: r.metadata.id,
        pattern: r.spec.patterns[0]?.pattern || r.spec.name,
        matchType: (r.spec.patterns[0]?.matchType?.toLowerCase() as any) || "wildcard",
        actions: r.spec.actions
      })) : [],
      connections: connectionsData ? connectionsData.map(c => ({
        id: c.metadata.id,
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
        avatarUrl: m.status.authorAvatarUrl ? m.status.authorAvatarUrl.replace(/\.(png|jpg|jpeg|gif)/i, '.webp') : null,
        createdAt: m.metadata.createdAt
      })) || [],
      permissions: activeHubFull?.metadata.permissions || getDefaultPermissions(),
      effectiveRole: activeHubFull?.metadata.effectiveRole || "NONE",
      settings: activeHubFull?.spec.settings || 0,
    };
  }, [activeHubFull, connectionsData, rulesData, messagesData]);

  // Merge server config with local unsaved drafts
  const activeConfig = useMemo(() => {
    return { ...serverConfig, ...draftConfig };
  }, [serverConfig, draftConfig]);

  const handleToggleConfig = (field: "nsfw" | "locked" | "profanityFilter") => {
    // Note: profanityFilter is a separate resource (rules). Here we only buffer Hub settings.
    if (field === "profanityFilter") {
      message.info("Anti-swear rules are managed independently below.");
      return;
    }
    setDraftConfig(prev => {
      const newVal = prev[field] !== undefined ? !prev[field] : !serverConfig[field];
      // If we toggled it back to original, remove from draft
      if (newVal === serverConfig[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [field]: newVal };
    });
  };

  const handleNumberConfigChange = (field: "appealCooldown", value: number) => {
    setDraftConfig(prev => {
      if (value === serverConfig[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [field]: value };
    });
  };

  const handleTextConfigChange = (field: "welcomeMessage", value: string) => {
    setDraftConfig(prev => {
      if (value === serverConfig[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSettingsFlagChange = (flag: string, enabled: boolean) => {
    setDraftConfig(prev => {
      const currentSettings = prev.settings !== undefined ? prev.settings : serverConfig.settings;
      const flagBit = HubSettingsFlags[flag as keyof typeof HubSettingsFlags] || 0;
      const newSettings = enabled ? (currentSettings | flagBit) : (currentSettings & ~flagBit);
      if (newSettings === serverConfig.settings) {
        const { settings: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, settings: newSettings };
    });
  };

  const { mutateAsync: batchUpdateAutomodRules } = useMutation(orpc.moderation.batchUpdateAutomodRules.mutationOptions());

  const handleSaveChanges = async () => {
    if (!isDirty) return;
    try {
      if (draftConfig.nsfw !== undefined || draftConfig.locked !== undefined || draftConfig.appealCooldown !== undefined || draftConfig.welcomeMessage !== undefined || draftConfig.settings !== undefined) {
        await patchHubConfig({
          hubId: selectedHubId,
          nsfw: draftConfig.nsfw,
          locked: draftConfig.locked,
          appealCooldownHours: draftConfig.appealCooldown,
          welcomeMessage: draftConfig.welcomeMessage,
          settings: draftConfig.settings,
        });
      }

      if (draftConfig.automodRules !== undefined) {
        await batchUpdateAutomodRules({
          hubId: selectedHubId,
          rules: draftConfig.automodRules,
        });
      }

      message.success("Changes saved successfully!");
      setDraftConfig({});
      queryClient.invalidateQueries({ queryKey: orpc.hub.getUserHubs.key() });
      queryClient.invalidateQueries({ queryKey: orpc.moderation.getAutomodRules.key() });
    } catch (e: any) {
      message.error(e.message || "Failed to save changes.");
    }
  };

  const handleDiscardChanges = () => {
    setDraftConfig({});
  };
  const handleToggleConnection = async (connectionId: string) => {
    const conn = activeConfig.connections.find(c => c.id === connectionId);
    if (!conn) return;
    try {
      await toggleConnectionMutation({ connectionId, enabled: !conn.connected, hubId: selectedHubId });
      message.success(conn.connected ? "Connection paused." : "Connection resumed.");
      queryClient.invalidateQueries({ queryKey: orpc.hub.getConnections.key() });
    } catch (e: any) {
      message.error(e.message || "Failed to toggle connection.");
    }
  };

  const handleDisconnectConnection = async (connectionId: string) => {
    Modal.confirm({
      title: "Disconnect Server",
      content: "Are you sure you want to disconnect this server? The channel will no longer receive hub messages.",
      okText: "Disconnect",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await disconnectConnectionMutation({ connectionId, hubId: selectedHubId });
          message.success("Server disconnected.");
          queryClient.invalidateQueries({ queryKey: orpc.hub.getConnections.key() });
        } catch (e: any) {
          message.error(e.message || "Failed to disconnect.");
        }
      },
    });
  };

  const handleAddConnection = () => {
    let channelId = "";
    let serverId = "";
    let webhookUrl = "";
    Modal.confirm({
      title: "Connect a Discord Server",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          <Input placeholder="Channel ID" onChange={(e) => { channelId = e.target.value; }} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #2d2d34", color: "white" }} />
          <Input placeholder="Server ID" onChange={(e) => { serverId = e.target.value; }} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #2d2d34", color: "white" }} />
          <Input placeholder="Webhook URL" onChange={(e) => { webhookUrl = e.target.value; }} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #2d2d34", color: "white" }} />
        </div>
      ),
      okText: "Connect",
      cancelText: "Cancel",
      onOk: async () => {
        if (!channelId || !serverId || !webhookUrl) {
          message.error("All fields are required.");
          return;
        }
        try {
          await createConnectionMutation({ hubId: selectedHubId, channelId, serverId, webhookUrl });
          message.success("Server connected.");
          queryClient.invalidateQueries({ queryKey: orpc.hub.getConnections.key() });
        } catch (e: any) {
          message.error(e.message || "Failed to connect server.");
        }
      },
    });
  };

  const handleDeleteHub = () => {
    if (activeConfig.effectiveRole !== "OWNER") return;
    Modal.confirm({
      title: "Delete Hub",
      content: `Are you sure you want to permanently delete "${activeHub.name}"? This action cannot be undone. All messages, connections, and settings will be lost.`,
      okText: "Delete Hub",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteHubMutation({ hubId: selectedHubId });
          message.success("Hub deleted.");
          setDraftConfig({});
          navigate("/dashboard");
        } catch (e: any) {
          message.error(e.message || "Failed to delete hub.");
        }
      },
    });
  };

  const handleTransferOwnership = () => {
    if (activeConfig.effectiveRole !== "OWNER") return;
    let newOwnerId = "";
    Modal.confirm({
      title: "Transfer Ownership",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          <Input placeholder="New owner's User ID" onChange={(e) => { newOwnerId = e.target.value; }} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #2d2d34", color: "white" }} />
        </div>
      ),
      okText: "Transfer",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        if (!newOwnerId) {
          message.error("User ID is required.");
          return;
        }
        try {
          await transferOwnershipMutation({ hubId: selectedHubId, newOwnerId });
          message.success("Ownership transferred.");
          queryClient.invalidateQueries({ queryKey: orpc.hub.getUserHubs.key() });
        } catch (e: any) {
          message.error(e.message || "Failed to transfer ownership.");
        }
      },
    });
  };

  const handleNukeMessages = () => {
    if (!activeConfig.permissions.MODERATE_MESSAGES) return;
    Modal.confirm({
      title: "Nuke All Messages",
      content: `Are you sure you want to permanently delete ALL messages in "${activeHub.name}"? This action cannot be undone.`,
      okText: "Nuke Messages",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await nukeMessagesMutation({ hubId: selectedHubId });
          message.success(`${result.deletedCount || 0} messages deleted.`);
          queryClient.invalidateQueries({ queryKey: orpc.hub.getRecentMessages.key() });
        } catch (e: any) {
          message.error(e.message || "Failed to nuke messages.");
        }
      },
    });
  };

  const handleAddAutomodRule = (rule: AutomodRule) => {
    setDraftConfig(prev => {
      const currentRules = prev.automodRules || serverConfig.automodRules || [];
      return { ...prev, automodRules: [...currentRules, rule] };
    });
  };

  const handleRemoveAutomodRule = (id: string) => {
    setDraftConfig(prev => {
      const currentRules = prev.automodRules || serverConfig.automodRules || [];
      return { ...prev, automodRules: currentRules.filter((r: AutomodRule) => r.id !== id) };
    });
  };
  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedHubId) return;
    try {
      await sendMessageMutation({
        hubId: selectedHubId,
        content: chatInput.trim(),
        guildId: "web-dashboard",
        channelId: "web-dashboard",
      });
      setChatInput("");
    } catch (e: any) {
      message.error(e.message || "Failed to send message.");
    }
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
      <Row style={{ height: '100%', position: 'relative' }}>
        <Col xs={24} lg={24} style={{ paddingTop: 24, height: '100%', overflowY: 'auto', paddingRight: 64, position: 'relative' }} className="dark-scrollbar">
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
                    onAppealCooldownChange={(v) => handleNumberConfigChange('appealCooldown', v)}
                    onAddAutomodRule={handleAddAutomodRule}
                    onRemoveAutomodRule={handleRemoveAutomodRule}
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
                    activeHubId={selectedHubId}
                    onAddConnection={handleAddConnection}
                    onToggleConnection={handleToggleConnection}
                    onDisconnectConnection={handleDisconnectConnection}
                    onDeleteHub={handleDeleteHub}
                    onTransferOwnership={handleTransferOwnership}
                    onNukeMessages={handleNukeMessages}
                    onWelcomeMessageChange={(value) => handleTextConfigChange("welcomeMessage", value)}
                    onSettingsFlagChange={handleSettingsFlagChange}
                  />
                )
              },
              // TODO: Add a new Server Settings tab to manage global automod packs per-server.
            ]}
          />
          </div>
          {hubs.length === 0 && (
            <EmptyDashboardState onCreateHub={() => setShowOnboarding(true)} />
          )}
        </Col>

        <HubSelector hubs={hubs} configs={dummyConfigs as any} selectedHubId={selectedHubId} onSelectHub={handleSelectHub} onCreateHub={() => setShowOnboarding(true)} />
      </Row>

      <UnsavedChangesBanner 
        isDirty={isDirty} 
        onReset={handleDiscardChanges} 
        onSave={handleSaveChanges} 
        isSaving={isSavingHubConfig} 
      />

      <Modal
        title={<span style={{ color: "white" }}>Unsaved Changes</span>}
        open={blocker.state === "blocked"}
        onOk={() => {
          setDraftConfig({});
          blocker.proceed?.();
        }}
        onCancel={() => blocker.reset?.()}
        okText="Discard Changes"
        okType="danger"
        cancelText="Keep Editing"
        styles={{
          mask: {
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          },
          body: {
            background: "rgba(20, 20, 25, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(48px)",
            WebkitBackdropFilter: "blur(48px)",
            padding: 24,
            overflow: "hidden",
            position: "relative",
          },
          header: {
            background: "transparent",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            paddingBottom: 16,
            marginBottom: 16
          }
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.65)" }}>You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.</p>
      </Modal>

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
