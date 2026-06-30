import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message, Spin, Modal } from "antd";
import { orpc } from "~/lib/orpc";
import { RuleSearch } from "./RuleSearch";
import { RuleList } from "./RuleList";
import { RuleEditor } from "./RuleEditor";
import { EmptyState } from "./EmptyState";
import type { AutomodRuleResource } from "~/resources/moderation";

interface AutomodPaneProps {
  hubId: string;
  canManageRules: boolean;
}

export function AutomodPane({ hubId, canManageRules }: AutomodPaneProps) {
  const queryClient = useQueryClient();
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  // Fetch AutoMod rules for selected Hub
  const { data: rules, isLoading: rulesLoading } = useQuery(
    orpc.moderation.getAutomodRules.queryOptions({
      input: { hubId },
      enabled: !!hubId,
    })
  );

  // Fetch detailed rule when selected
  const { data: detailedRule, isLoading: detailedRuleLoading } = useQuery(
    orpc.moderation.getAutomodRule.queryOptions({
      input: { hubId, ruleId: selectedRuleId || "" },
      enabled: !!selectedRuleId && !!hubId,
    })
  );

  const rulesList = rules || [];

  // Mutations
  const createRuleMutation = useMutation(orpc.moderation.createAutomodRule.mutationOptions());
  const updateRuleMutation = useMutation(orpc.moderation.updateAutomodRule.mutationOptions());
  const deleteRuleMutation = useMutation(orpc.moderation.deleteAutomodRule.mutationOptions());

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
      // Fetch full rule details first to clone the patterns and whitelist
      const fullRule = await queryClient.fetchQuery(
        orpc.moderation.getAutomodRule.queryOptions({
          input: { hubId, ruleId: ruleToDuplicate.metadata.id },
        })
      );

      const result = await createRuleMutation.mutateAsync({
        hubId,
        name: `${fullRule.spec.name} (Copy)`,
        actions: fullRule.spec.actions as any,
        muteDurationMinutes: fullRule.spec.muteDurationMinutes,
        patterns: fullRule.spec.patterns.map((p) => ({
          pattern: p.pattern,
          matchType: p.matchType,
        })),
        whitelist: fullRule.spec.whitelist.map((w) => w.word),
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
        enabled: !ruleToToggle.spec.enabled,
      });
      message.success(
        `Rule ${!ruleToToggle.spec.enabled ? "enabled" : "disabled"} successfully.`
      );
      queryClient.invalidateQueries({ queryKey: orpc.moderation.getAutomodRules.key() });
      queryClient.invalidateQueries({ queryKey: orpc.moderation.getAutomodRule.key() });
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
      queryClient.invalidateQueries({ queryKey: orpc.moderation.getAutomodRules.key() });
      queryClient.invalidateQueries({ queryKey: orpc.moderation.getAutomodRule.key() });
    } catch (e: any) {
      message.error(e.message || "Failed to save rule.");
      throw e;
    }
  };

  if (rulesLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: 40 }}>
        <Spin size="medium" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, height: "100%", overflow: "hidden", flexDirection: "column" }}>
      {/* Rule Search Header */}
      <div style={{ padding: "0px 0px 12px 0px" }}>
        <RuleSearch
          searchQuery={searchText}
          onSearchChange={setSearchText}
          onNewRuleClick={handleNewRule}
          canManageRules={canManageRules}
        />
      </div>

      {/* Rule List Container */}
      <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }} className="dark-scrollbar">
        <RuleList
          rules={rulesList}
          selectedRuleId={selectedRuleId}
          searchQuery={searchText}
          onSelectRule={setSelectedRuleId}
          onDuplicateRule={handleDuplicateRule}
          onToggleEnableRule={handleToggleEnableRule}
          onDeleteRule={handleDeleteRule}
          canManageRules={canManageRules}
          onNewRuleClick={handleNewRule}
        />
      </div>

      {/* Spacious Edit Modal */}
      <Modal
        open={!!selectedRuleId}
        onCancel={() => setSelectedRuleId(null)}
        footer={null}
        closeIcon={null}
        width={800}
        centered
        transitionName=""
        style={{
          background: "#18181b",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
          padding: 0,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0, 0, 0, 0.6)",
        }}
        styles={{
          body: {
            padding: 0,
          },
          mask: {
            backdropFilter: "blur(4px)",
            transition: "opacity 0.18s ease",
          },
        }}
        destroyOnClose
      >
        {detailedRuleLoading || !detailedRule ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
            <Spin size="medium" />
          </div>
        ) : (
          <RuleEditor
            rule={detailedRule}
            onSave={handleSaveEditor}
            onCancel={() => setSelectedRuleId(null)}
            isLoading={updateRuleMutation.isPending}
            canManageRules={canManageRules}
          />
        )}
      </Modal>
    </div>
  );
}
