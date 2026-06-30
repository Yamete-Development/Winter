import { RuleCard } from "./RuleCard";
import { EmptyState } from "./EmptyState";
import type { AutomodRuleResource } from "~/resources/moderation";

interface RuleListProps {
  rules: AutomodRuleResource[];
  selectedRuleId: string | null;
  searchQuery: string;
  onSelectRule: (ruleId: string) => void;
  onDuplicateRule: (rule: AutomodRuleResource) => void;
  onToggleEnableRule: (rule: AutomodRuleResource) => void;
  onDeleteRule: (rule: AutomodRuleResource) => void;
  canManageRules: boolean;
  onNewRuleClick: () => void;
}

export function RuleList({
  rules,
  selectedRuleId,
  searchQuery,
  onSelectRule,
  onDuplicateRule,
  onToggleEnableRule,
  onDeleteRule,
  canManageRules,
  onNewRuleClick,
}: RuleListProps) {
  if (rules.length === 0) {
    return (
      <EmptyState
        type="NO_RULES"
        onNewRuleClick={onNewRuleClick}
        canManageRules={canManageRules}
      />
    );
  }

  // Filter rules based on search query
  const filteredRules = rules.filter((rule) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const nameMatches = rule.spec.name.toLowerCase().includes(query);
    const patternMatches = rule.spec.patterns.some((p) =>
      p.pattern.toLowerCase().includes(query)
    );
    const whitelistMatches = rule.spec.whitelist.some((w) =>
      w.word.toLowerCase().includes(query)
    );

    return nameMatches || patternMatches || whitelistMatches;
  });

  if (filteredRules.length === 0) {
    return <EmptyState type="NO_RESULTS" />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 20,
        overflowY: "auto",
        flex: 1,
      }}
      className="dark-scrollbar"
    >
      {filteredRules.map((rule) => (
        <RuleCard
          key={rule.metadata.id}
          rule={rule}
          isSelected={selectedRuleId === rule.metadata.id}
          onSelect={() => onSelectRule(rule.metadata.id)}
          onDuplicate={() => onDuplicateRule(rule)}
          onToggleEnable={() => onToggleEnableRule(rule)}
          onDelete={() => onDeleteRule(rule)}
          canManageRules={canManageRules}
        />
      ))}
    </div>
  );
}
