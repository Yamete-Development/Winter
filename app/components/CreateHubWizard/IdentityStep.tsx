import { Input, Typography } from "antd";
import type { HubFormValues } from "./types";

const { Text } = Typography;

type IdentityStepProps = {
  formData: HubFormValues;
  updateField: <K extends keyof HubFormValues>(field: K, value: HubFormValues[K]) => void;
  fieldErrors: Partial<Record<keyof HubFormValues, string>>;
};

export function IdentityStep({ formData, updateField, fieldErrors }: IdentityStepProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 540 }}>
      {/* Icon + Name row */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: formData.iconUrl
                ? `url(${formData.iconUrl}) center/cover no-repeat`
                : "#27272a",
              border: "2px solid #3f3f46",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {!formData.iconUrl && (
              <span style={{ color: "#52525b", fontSize: 26, lineHeight: 1 }}>?</span>
            )}
          </div>
          <Text style={{ color: "#71717a", fontSize: "0.72rem", letterSpacing: "0.04em" }}>ICON</Text>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <Text strong style={{ display: "block", color: "#e4e4e7", marginBottom: 8 }}>
              Hub name <span style={{ color: "#ef4444" }}>*</span>
            </Text>
            <Input
              size="large"
              value={formData.name}
              onChange={event => updateField("name", event.target.value)}
              placeholder="Gaming Network"
              status={fieldErrors.name ? "error" : undefined}
              style={{ background: "#27272a", borderColor: fieldErrors.name ? "#ef4444" : "#3f3f46", color: "white", borderRadius: 8 }}
            />
            {fieldErrors.name && (
              <Text style={{ display: "block", color: "#ef4444", marginTop: 6, fontSize: "0.85rem" }}>
                {fieldErrors.name}
              </Text>
            )}
          </div>
          <div>
            <Text strong style={{ display: "block", color: "#e4e4e7", marginBottom: 8 }}>
              Icon URL
            </Text>
            <Input
              value={formData.iconUrl}
              onChange={event => updateField("iconUrl", event.target.value)}
              placeholder="https://example.com/icon.png"
              style={{ background: "#27272a", borderColor: "#3f3f46", color: "white", borderRadius: 8 }}
            />
          </div>
        </div>
      </div>

      <div>
        <Text strong style={{ display: "block", color: "#e4e4e7", marginBottom: 8 }}>
          Short description <span style={{ color: "#ef4444" }}>*</span>
        </Text>
        <Input
          size="large"
          value={formData.shortDescription}
          onChange={event => updateField("shortDescription", event.target.value)}
          placeholder="Cross-server playbook for shooters..."
          status={fieldErrors.shortDescription ? "error" : undefined}
          style={{ background: "#27272a", borderColor: fieldErrors.shortDescription ? "#ef4444" : "#3f3f46", color: "white", borderRadius: 8 }}
        />
        {fieldErrors.shortDescription && (
          <Text style={{ display: "block", color: "#ef4444", marginTop: 6, fontSize: "0.85rem" }}>
            {fieldErrors.shortDescription}
          </Text>
        )}
      </div>

      <div>
        <Text strong style={{ display: "block", color: "#e4e4e7", marginBottom: 8 }}>
          Full description
        </Text>
        <Input.TextArea
          rows={4}
          value={formData.description}
          onChange={event => updateField("description", event.target.value)}
          placeholder="Optional longer description for members..."
          status={fieldErrors.description ? "error" : undefined}
          style={{ background: "#27272a", borderColor: fieldErrors.description ? "#ef4444" : "#3f3f46", color: "white", resize: "none", borderRadius: 8 }}
        />
        {fieldErrors.description && (
          <Text style={{ display: "block", color: "#ef4444", marginTop: 6, fontSize: "0.85rem" }}>
            {fieldErrors.description}
          </Text>
        )}
      </div>
    </div>
  );
}
