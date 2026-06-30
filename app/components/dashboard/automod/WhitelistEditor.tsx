import { Input, Typography } from "antd";

const { Text } = Typography;

interface WhitelistEditorProps {
  value: string;
  onChange: (text: string, parsed: string[], isValid: boolean) => void;
  disabled: boolean;
}

export function WhitelistEditor({ value, onChange, disabled }: WhitelistEditorProps) {
  const items = value
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const uniqueItems = Array.from(new Set(items));

  const parsedItems = uniqueItems.map((item) => {
    // Whitelist accepts plain words only: no asterisks, no regex characters
    const hasAsterisk = item.includes("*");
    const regexChars = /[.?+^$|()\[\]{}\\]/;
    const hasRegex = regexChars.test(item);

    if (hasAsterisk) {
      return { word: item, valid: false, error: "Wildcards (*) are not allowed in whitelist." };
    }
    if (hasRegex) {
      return { word: item, valid: false, error: "Regex is not allowed." };
    }
    return { word: item, valid: true };
  });

  const handleChange = (text: string) => {
    const currentItems = text
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const currentUniqueItems = Array.from(new Set(currentItems));

    const currentParsedItems = currentUniqueItems.map((item) => {
      const hasAsterisk = item.includes("*");
      const regexChars = /[.?+^$|()\[\]{}\\]/;
      const hasRegex = regexChars.test(item);

      if (hasAsterisk) {
        return { word: item, valid: false, error: "Wildcards (*) are not allowed in whitelist." };
      }
      if (hasRegex) {
        return { word: item, valid: false, error: "Regex is not allowed." };
      }
      return { word: item, valid: true };
    });

    const isValid = currentParsedItems.every((item) => item.valid);
    const validWords = currentParsedItems
      .filter((item) => item.valid)
      .map((item) => item.word);

    onChange(text, validWords, isValid);
  };

  const errors = parsedItems.filter((item) => !item.valid).map((item) => item.error);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <Text style={{ display: "block", color: "#fff", fontWeight: 600, fontSize: "0.9rem", marginBottom: 4 }}>
          Whitelist
        </Text>
        <Text type="secondary" style={{ fontSize: "0.8rem", display: "block", marginBottom: 8 }}>
          Exceptions that should bypass the filter. Accepts plain words only (no wildcards or regex). Separate with commas or newlines.
        </Text>
      </div>

      <Input.TextArea
        rows={3}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter whitelisted words (e.g. whitelistword, safephrase)..."
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
