import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Col, Row, Typography, Spin, message, Modal } from "antd";
import { orpc } from "~/lib/orpc";
import { RuleSearch } from "~/components/dashboard/automod/RuleSearch";
import { RuleList } from "~/components/dashboard/automod/RuleList";
import { RuleEditor } from "~/components/dashboard/automod/RuleEditor";
import { EmptyState } from "~/components/dashboard/automod/EmptyState";
import { HubSelector } from "~/components/dashboard/HubSelector";
import { EmptyDashboardState } from "~/components/dashboard/EmptyDashboardState";
import { CreateHubWizard } from "~/components/CreateHubWizard";
import { getDefaultPermissions } from "~/permissions/config";
import type { AutomodRuleResource } from "~/resources/moderation";

const { Title, Text } = Typography;

export default function AutoModPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Get user hubs
  const { data: userHubs, isLoading: hubsLoading } = useQuery(
    orpc.hub.getUserHubs.queryOptions()
  );

  const hubsList = userHubs || [];
  const hubId = searchParams.get("hubId") || hubsList[0]?.metadata.id || "";

  // Map to DashboardHub[] for HubSelector
  const hubs = useMemo(() => {
    return hubsList.map((h) => ({
      id: h.metadata.id,
      name: h.metadata.name,
      avatarUrl: h.spec.iconUrl || "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=300&auto=format&fit=crop",
      bannerUrl: h.spec.bannerUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
      verified: h.status.verified,
      partnered: h.status.partnered,
      weeklyMsgs: h.status.weeklyMessageCount ? h.status.weeklyMessageCount.toString() : "0",
    }));
  }, [hubsList]);

  // Keep search params in sync
  useEffect(() => {
    if (hubsList.length > 0 && !searchParams.get("hubId")) {
      setSearchParams({ hubId: hubsList[0].metadata.id });
    }
  }, [hubsList, searchParams, setSearchParams]);

  // Fetch AutoMod rules for selected Hub
  const { data: rules, isLoading: rulesLoading } = useQuery(
    orpc.moderation.getAutomodRules.queryOptions({
      input: { hubId },
      enabled: !!hubId,
    })
  );

  const rulesList = rules || [];

  // Mutations
  const createRuleMutation = useMutation(
    orpc.moderation.createAutomodRule.mutationOptions()
  );
  const updateRuleMutation = useMutation(
    orpc.moderation.updateAutomodRule.mutationOptions()
  );
  const deleteRuleMutation = useMutation(
    orpc.moderation.deleteAutomodRule.mutationOptions()
  );

  // Active hub metadata
  const activeHubFull = hubsList.find((h) => h.metadata.id === hubId);
  const permissions = activeHubFull?.metadata.permissions || getDefaultPermissions();
  const canManageRules = Boolean(permissions.MANAGE_RULES);

  // Selected Rule Resource
  const selectedRule = useMemo(() => {
    if (!selectedRuleId) return null;
    return rulesList.find((r) => r.metadata.id === selectedRuleId) || null;
  }, [selectedRuleId, rulesList]);

  // Reset selected rule when changing hub
  useEffect(() => {
    setSelectedRuleId(null);
  }, [hubId]);

  const handleNewRule = async () => {
    if (!canManageRules) return;
    try {
      const result = await createRuleMutation.mutateAsync({
        hubId,
        name: "New AutoMod Rule",
        actions: ["BLOCK_MESSAGE"],
        patterns: [],
        whitelist: [],
      });
      message.success("Rule created successfully.");
      queryClient.invalidateQueries({ queryKey: orpc.moderation.getAutomodRules.key() });
      setSelectedRuleId(result.id);
    } catch (e: any) {
      message.error(e.message || "Failed to create rule.");
    }
  };

  const handleDuplicateRule = async (ruleToDuplicate: AutomodRuleResource) => {
    if (!canManageRules) return;
    try {
      const result = await createRuleMutation.mutateAsync({
        hubId,
        name: `${ruleToDuplicate.spec.name} (Copy)`,
        actions: ruleToDuplicate.spec.actions as any,
        muteDurationMinutes: ruleToDuplicate.spec.muteDurationMinutes,
        patterns: ruleToDuplicate.spec.patterns.map((p) => ({
          pattern: p.pattern,
          matchType: p.matchType,
        })),
        whitelist: ruleToDuplicate.spec.whitelist.map((w) => w.word),
      });
      message.success("Rule duplicated successfully.");
      queryClient.invalidateQueries({ queryKey: orpc.moderation.getAutomodRules.key() });
      setSelectedRuleId(result.id);
    } catch (e: any) {
      message.error(e.message || "Failed to duplicate rule.");
    }
  };

  const handleToggleEnableRule = async (ruleToToggle: AutomodRuleResource) => {
    if (!canManageRules) return;
    try {
      await updateRuleMutation.mutateAsync({
        hubId,
        ruleId: ruleToToggle.metadata.id,
        name: ruleToToggle.spec.name,
        enabled: !ruleToToggle.spec.enabled,
        actions: ruleToToggle.spec.actions as any,
        muteDurationMinutes: ruleToToggle.spec.muteDurationMinutes,
        patterns: ruleToToggle.spec.patterns.map((p) => ({
          pattern: p.pattern,
          matchType: p.matchType,
        })),
        whitelist: ruleToToggle.spec.whitelist.map((w) => w.word),
      });
      message.success(
        `Rule ${!ruleToToggle.spec.enabled ? "enabled" : "disabled"} successfully.`
      );
      queryClient.invalidateQueries({ queryKey: orpc.moderation.getAutomodRules.key() });
    } catch (e: any) {
      message.error(e.message || "Failed to toggle rule.");
    }
  };

  const handleDeleteRule = (ruleToDelete: AutomodRuleResource) => {
    if (!canManageRules) return;
    Modal.confirm({
      title: "Delete AutoMod Rule",
      content: `Are you sure you want to delete "${ruleToDelete.spec.name}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      styles: {
        mask: {
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        },
      },
      onOk: async () => {
        try {
          await deleteRuleMutation.mutateAsync({
            hubId,
            ruleId: ruleToDelete.metadata.id,
          });
          message.success("Rule deleted successfully.");
          if (selectedRuleId === ruleToDelete.metadata.id) {
            setSelectedRuleId(null);
          }
          queryClient.invalidateQueries({ queryKey: orpc.moderation.getAutomodRules.key() });
        } catch (e: any) {
          message.error(e.message || "Failed to delete rule.");
        }
      },
    });
  };

  const handleSaveEditor = async (
    ruleId: string,
    updates: {
      name: string;
      enabled: boolean;
      actions: string[];
      muteDurationMinutes: number | null;
      patterns: { pattern: string; matchType: "EXACT" | "PREFIX" | "SUFFIX" | "WILDCARD" }[];
      whitelist: string[];
    }
  ) => {
    try {
      await updateRuleMutation.mutateAsync({
        hubId,
        ruleId,
        name: updates.name,
        enabled: updates.enabled,
        actions: updates.actions as any,
        muteDurationMinutes: updates.muteDurationMinutes,
        patterns: updates.patterns,
        whitelist: updates.whitelist,
      });
      message.success("Rule saved successfully.");
      queryClient.invalidateQueries({ queryKey: orpc.moderation.getAutomodRules.key() });
    } catch (e: any) {
      message.error(e.message || "Failed to save rule.");
    }
  };

  // Keyboard shortcut listener for Escape key to deselect/cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedRuleId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (hubsLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%" }}>
        <Spin size="large" />
      </div>
    );
  }

  // Fallback for HubSelector configs mapping
  const dummyConfigs = useMemo(() => {
    const cfgs: Record<string, any> = {};
    for (const h of hubsList) {
      cfgs[h.metadata.id] = {
        connections: [],
      };
    }
    if (hubId && activeHubFull) {
      cfgs[hubId] = activeHubFull;
    }
    return cfgs;
  }, [hubsList, hubId, activeHubFull]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, paddingRight: 64 }}>
      <div
        style={
          hubsList.length === 0
            ? { filter: "blur(5px)", pointerEvents: "none", userSelect: "none", opacity: 0.3 }
            : {}
        }
      >
        {/* Page Header */}
        <div style={{ marginBottom: 20, paddingTop: 24 }}>
          <Text style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            InterChat Safety Control
          </Text>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
            <div>
              <Title level={2} style={{ margin: 0, color: "white", lineHeight: 1.1 }}>
                AutoMod Rules
              </Title>
              <Text type="secondary" style={{ fontSize: "0.95rem" }}>
                Manage patterns, whitelists, and automated actions for messages in your hub.
              </Text>
            </div>
          </div>
        </div>

        {/* Dashboard Panels */}
        {rulesLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={24} style={{ minHeight: "600px", height: "calc(100vh - 200px)", overflow: "hidden" }}>
            {/* LEFT Panel (Search & List) */}
            <Col xs={24} md={10} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  background: "rgba(20, 20, 25, 0.4)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <RuleSearch
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onNewRuleClick={handleNewRule}
                  canManageRules={canManageRules}
                />
                <RuleList
                  rules={rulesList}
                  selectedRuleId={selectedRuleId}
                  searchQuery={searchQuery}
                  onSelectRule={setSelectedRuleId}
                  onDuplicateRule={handleDuplicateRule}
                  onToggleEnableRule={handleToggleEnableRule}
                  onDeleteRule={handleDeleteRule}
                  canManageRules={canManageRules}
                  onNewRuleClick={handleNewRule}
                />
              </div>
            </Col>

            {/* RIGHT Panel (Editor) */}
            <Col xs={24} md={14} style={{ height: "100%" }}>
              <div
                style={{
                  height: "100%",
                  background: "rgba(20, 20, 25, 0.4)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <RuleEditor
                  rule={selectedRule}
                  onSave={handleSaveEditor}
                  onCancel={() => setSelectedRuleId(null)}
                  isLoading={updateRuleMutation.isPending}
                  canManageRules={canManageRules}
                />
              </div>
            </Col>
          </Row>
        )}
      </div>

      {hubsList.length === 0 && (
        <EmptyDashboardState onCreateHub={() => setShowOnboarding(true)} />
      )}

      {/* Floating Hub Selector on the right */}
      {hubsList.length > 0 && (
        <HubSelector
          hubs={hubs}
          configs={dummyConfigs as any}
          selectedHubId={hubId}
          onSelectHub={(id) => setSearchParams({ hubId: id })}
          onCreateHub={() => setShowOnboarding(true)}
        />
      )}

      <CreateHubWizard
        mode="modal"
        open={showOnboarding}
        isFirstHub={hubsList.length === 0}
        onCancel={() => setShowOnboarding(false)}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: orpc.hub.getUserHubs.key() });
          setShowOnboarding(false);
        }}
      />
    </div>
  );
}
