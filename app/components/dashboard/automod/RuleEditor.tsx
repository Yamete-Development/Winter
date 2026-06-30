import { useState, useEffect } from "react";
import { Input, Switch, Typography, Divider, Button } from "antd";
import { PatternEditor } from "./PatternEditor";
import { WhitelistEditor } from "./WhitelistEditor";
import { ActionSelector } from "./ActionSelector";
import { SaveBar } from "./SaveBar";
import { EmptyState } from "./EmptyState";
import type { AutomodRuleResource } from "~/resources/moderation";

const { Text } = Typography;

import { CloseOutlined } from "@ant-design/icons";

interface RuleEditorProps {
  rule: AutomodRuleResource | null;
  onSave: (
    ruleId: string,
    updates: {
      name: string;
      enabled: boolean;
      actions: string[];
      muteDurationMinutes: number | null;
      patterns: { pattern: string; matchType: "EXACT" | "PREFIX" | "SUFFIX" | "WILDCARD" }[];
      whitelist: string[];
    }
  ) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  canManageRules: boolean;
}

export function RuleEditor({
  rule,
  onSave,
  onCancel,
  isLoading,
  canManageRules,
}: RuleEditorProps) {
  if (!rule) {
    return <EmptyState type="noSelection" />;
  }

  // Form State
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [rawPatterns, setRawPatterns] = useState("");
  const [rawWhitelist, setRawWhitelist] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const [muteDurationMinutes, setMuteDurationMinutes] = useState<number | null>(null);

  // Validation & Parsed State
  const [patternsValid, setPatternsValid] = useState(true);
  const [whitelistValid, setWhitelistValid] = useState(true);
  const [parsedPatterns, setParsedPatterns] = useState<{ pattern: string; matchType: "EXACT" | "PREFIX" | "SUFFIX" | "WILDCARD" }[]>([]);
  const [parsedWhitelist, setParsedWhitelist] = useState<string[]>([]);

  // Reset form when active rule changes
  useEffect(() => {
    setName(rule.spec.name);
    setEnabled(rule.spec.enabled);
    setActions(rule.spec.actions);
    setMuteDurationMinutes(rule.spec.muteDurationMinutes);

    // Reconstruct raw pattern textarea string
    const pats = rule.spec.patterns.map((p) => {
      if (p.matchType === "WILDCARD") return `*${p.pattern}*`;
      if (p.matchType === "PREFIX") return `${p.pattern}*`;
      if (p.matchType === "SUFFIX") return `*${p.pattern}`;
      return p.pattern;
    }).join(", ");
    setRawPatterns(pats);
    setParsedPatterns(rule.spec.patterns);

    // Reconstruct raw whitelist textarea string
    const wl = rule.spec.whitelist.map((w) => w.word).join(", ");
    setRawWhitelist(wl);
    setParsedWhitelist(rule.spec.whitelist.map((w) => w.word));

    setPatternsValid(true);
    setWhitelistValid(true);
  }, [rule]);

  const handleCancel = () => {
    if (rule) {
      setName(rule.spec.name);
      setEnabled(rule.spec.enabled);
      setActions(rule.spec.actions);
      setMuteDurationMinutes(rule.spec.muteDurationMinutes);

      const pats = rule.spec.patterns.map((p) => {
        if (p.matchType === "WILDCARD") return `*${p.pattern}*`;
        if (p.matchType === "PREFIX") return `${p.pattern}*`;
        if (p.matchType === "SUFFIX") return `*${p.pattern}`;
        return p.pattern;
      }).join(", ");
      setRawPatterns(pats);
      setParsedPatterns(rule.spec.patterns);

      const wl = rule.spec.whitelist.map((w) => w.word).join(", ");
      setRawWhitelist(wl);
      setParsedWhitelist(rule.spec.whitelist.map((w) => w.word));

      setPatternsValid(true);
      setWhitelistValid(true);
    }
    onCancel();
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    await onSave(rule.metadata.id, {
      name: name.trim(),
      enabled,
      actions,
      muteDurationMinutes,
      patterns: parsedPatterns,
      whitelist: parsedWhitelist,
    });
  };

  // Keyboard shortcut listener for Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const canSave = name.trim().length > 0 && patternsValid && whitelistValid && !isLoading && canManageRules;
        if (canSave) {
          void handleSave();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [name, enabled, actions, muteDurationMinutes, parsedPatterns, parsedWhitelist, patternsValid, whitelistValid, isLoading, canManageRules]);

  // Compare arrays
  const arrayEquals = (a: any[], b: any[]) =>
    a.length === b.length && a.every((val, index) => val === b[index]);

  const patternsChanged = () => {
    const origPatterns = rule.spec.patterns.map((p) => `${p.matchType}:${p.pattern}`).sort();
    const curPatterns = parsedPatterns.map((p) => `${p.matchType}:${p.pattern}`).sort();
    return !arrayEquals(origPatterns, curPatterns);
  };

  const timezoneOffset = () => false; // Dummy to avoid unused import issues if any

  const whitelistChanged = () => {
    const origWhitelist = rule.spec.whitelist.map((w) => w.word).sort();
    const curWhitelist = [...parsedWhitelist].sort();
    return !arrayEquals(origWhitelist, curWhitelist);
  };

  const isDirty =
    name !== rule.spec.name ||
    enabled !== rule.spec.enabled ||
    !arrayEquals([...actions].sort(), [...rule.spec.actions].sort()) ||
    muteDurationMinutes !== rule.spec.muteDurationMinutes ||
    patternsChanged() ||
    whitelistChanged();

  const isValid = name.trim().length > 0 && patternsValid && whitelistValid;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Editor Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(10, 10, 15, 0.2)",
          borderRadius: "10px 10px 0 0"
        }}
      >
        <div style={{ flex: 1, paddingRight: 16 }}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading || !canManageRules}
            placeholder="Rule Name"
            style={{
              background: "transparent",
              border: "none",
              boxShadow: "none",
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: 600,
              padding: 0,
              width: "100%",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem" }}>
              {enabled ? "Enabled" : "Disabled"}
            </Text>
            <Switch
              checked={enabled}
              onChange={setEnabled}
              disabled={isLoading || !canManageRules}
            />
          </div>
          <Button
            type="text"
            icon={<CloseOutlined style={{ color: "rgba(255,255,255,0.45)" }} />}
            onClick={onCancel}
            style={{ background: "transparent" }}
          />
        </div>
      </div>

      {/* Editor Body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
        className="dark-scrollbar"
      >
        <PatternEditor
          value={rawPatterns}
          onChange={(text, parsed, val) => {
            setRawPatterns(text);
            setParsedPatterns(parsed);
            setPatternsValid(val);
          }}
          disabled={isLoading || !canManageRules}
        />

        <Divider style={{ margin: "4px 0", borderColor: "rgba(255,255,255,0.06)" }} />

        <WhitelistEditor
          value={rawWhitelist}
          onChange={(text, parsed, val) => {
            setRawWhitelist(text);
            setParsedWhitelist(parsed);
            setWhitelistValid(val);
          }}
          disabled={isLoading || !canManageRules}
        />

        <Divider style={{ margin: "4px 0", borderColor: "rgba(255,255,255,0.06)" }} />

        <ActionSelector
          actions={actions}
          muteDurationMinutes={muteDurationMinutes}
          onActionsChange={setActions}
          onMuteDurationChange={setMuteDurationMinutes}
          disabled={isLoading || !canManageRules}
        />
      </div>

      {/* Editor Footer */}
      <SaveBar
        isDirty={isDirty}
        isValid={isValid}
        isLoading={isLoading}
        onCancel={handleCancel}
        onSave={handleSave}
        canManageRules={canManageRules}
      />
    </div>
  );
}
