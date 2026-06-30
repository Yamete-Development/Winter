import { Typography } from "antd";

const { Text } = Typography;

interface PatternEditorProps {
  value: string;
  onChange: (
    text: string,
    parsed: { pattern: string; matchType: "EXACT" | "PREFIX" | "SUFFIX" | "WILDCARD" }[],
    isValid: boolean
  ) => void;
  disabled: boolean;
}

export function parsePattern(rawPattern: string) {
  const pattern = rawPattern.trim();
  if (!pattern) return null;

  const asteriskCount = (pattern.match(/\*/g) || []).length;
  const regexChars = /[.?+^$|()\[\]{}\\]/;
  if (regexChars.test(pattern)) {
    return { pattern, valid: false, error: "Regex isn't supported." };
  }

  if (asteriskCount > 2) {
    return { pattern, valid: false, error: "Only wildcards (*) at boundaries are allowed." };
  }

  if (asteriskCount === 2) {
    if (pattern.startsWith("*") && pattern.endsWith("*")) {
      const inner = pattern.slice(1, -1);
      if (inner.includes("*")) {
        return { pattern, valid: false, error: "Only wildcards (*) at boundaries are allowed." };
      }
      if (inner.length === 0) {
        return { pattern, valid: false, error: "Pattern cannot be just wildcards." };
      }
      return { pattern, valid: true, matchType: "WILDCARD" as const, clean: inner };
    } else {
      return { pattern, valid: false, error: "Only wildcards (*) at boundaries are allowed." };
    }
  }

  if (asteriskCount === 1) {
    if (pattern.startsWith("*")) {
      const inner = pattern.slice(1);
      if (inner.length === 0) {
        return { pattern, valid: false, error: "Pattern cannot be just wildcards." };
      }
      return { pattern, valid: true, matchType: "SUFFIX" as const, clean: inner };
    } else if (pattern.endsWith("*")) {
      const inner = pattern.slice(0, -1);
      if (inner.length === 0) {
        return { pattern, valid: false, error: "Pattern cannot be just wildcards." };
      }
      return { pattern, valid: true, matchType: "PREFIX" as const, clean: inner };
    } else {
      return { pattern, valid: false, error: "Only one wildcard (*) is allowed." };
    }
  }

  return { pattern, valid: true, matchType: "EXACT" as const, clean: pattern };
}

import { Input } from "antd";

export function PatternEditor({ value, onChange, disabled }: PatternEditorProps) {
  const items = value
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const uniqueItems = Array.from(new Set(items));

  const parsedItems = uniqueItems.map((item) => {
    const result = parsePattern(item);
    return result || { pattern: item, valid: false, error: "Empty pattern" };
  });

  const handleChange = (text: string) => {
    const currentItems = text
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const currentUniqueItems = Array.from(new Set(currentItems));

    const currentParsedItems = currentUniqueItems.map((item) => {
      const result = parsePattern(item);
      return result || { pattern: item, valid: false, error: "Empty pattern" };
    });

    const isValid = currentParsedItems.every((item) => item.valid);

    const validPatterns = currentParsedItems
      .filter((item) => item.valid)
      .map((item) => ({
        pattern: item.clean || item.pattern,
        matchType: item.matchType || ("EXACT" as const),
      }));

    onChange(text, validPatterns, isValid);
  };

  const errors = parsedItems.filter((item) => !item.valid).map((item) => item.error);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <Text style={{ display: "block", color: "#fff", fontWeight: 600, fontSize: "0.9rem", marginBottom: 4 }}>
          Patterns
        </Text>
        <Text type="secondary" style={{ fontSize: "0.8rem", display: "block", marginBottom: 8 }}>
          Add words or phrases to match. Use <code>*</code> at the start or end for wildcards (e.g. <code>*word</code>, <code>word*</code>, <code>*word*</code>). Separate with commas or newlines.
        </Text>
      </div>

      <Input.TextArea
        rows={4}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter patterns (e.g. badword, spam*, *scam*)..."
        style={{
          background: "rgba(0,0,0,0.3)",
          border: errors.length > 0 ? "1px solid #ff4d4f" : "1px solid rgba(255, 255, 255, 0.08)",
          color: "#fff",
          borderRadius: 8,
        }}
      />

      {errors.length > 0 && (
        <div style={{ color: "#ff4d4f", fontSize: "0.8rem" }}>
          {errors[0]}
        </div>
      )}
    </div>
  );
}
