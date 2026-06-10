import { Input, Select, Typography } from "antd";
import { LANGUAGE_OPTIONS, REGION_OPTIONS, VISIBILITY_OPTIONS } from "./types";
import type { HubFormValues } from "./types";

const { Text } = Typography;

type DefaultsStepProps = {
  formData: HubFormValues;
  updateField: <K extends keyof HubFormValues>(field: K, value: HubFormValues[K]) => void;
};

export function DefaultsStep({ formData, updateField }: DefaultsStepProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 600 }}>
      <div>
        <Text strong style={{ display: "block", color: "#e4e4e7", marginBottom: 12 }}>
          Visibility
        </Text>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {VISIBILITY_OPTIONS.map(option => {
            const selected = formData.visibility === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField("visibility", option.value as HubFormValues["visibility"])}
                style={{
                  textAlign: "left",
                  padding: 16,
                  borderRadius: 8,
                  border: selected ? "2px solid #7c3aed" : "1px solid #3f3f46",
                  background: selected ? "rgba(124, 58, 237, 0.05)" : "#27272a",
                  cursor: "pointer",
                  color: "white",
                  transition: "all 0.15s ease",
                }}
              >
                <Text strong style={{ display: "block", color: "white", marginBottom: 4 }}>
                  {option.title}
                </Text>
                <Text style={{ color: "#a1a1aa", fontSize: "0.8rem", lineHeight: 1.4 }}>
                  {option.description}
                </Text>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <Text strong style={{ display: "block", color: "#e4e4e7", marginBottom: 8 }}>
            Primary language
          </Text>
          <Select
            size="large"
            value={formData.language}
            onChange={value => updateField("language", value)}
            options={LANGUAGE_OPTIONS.slice()}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <Text strong style={{ display: "block", color: "#e4e4e7", marginBottom: 8 }}>
            Region
          </Text>
          <Select
            size="large"
            value={formData.region}
            onChange={value => updateField("region", value)}
            options={REGION_OPTIONS.slice()}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div>
        <Text strong style={{ display: "block", color: "#e4e4e7", marginBottom: 8 }}>
          Welcome message
        </Text>
        <Input.TextArea
          rows={3}
          value={formData.welcomeMessage}
          onChange={event => updateField("welcomeMessage", event.target.value)}
          placeholder="Welcome to the bridge. Keep it clean..."
          style={{ background: "#27272a", borderColor: "#3f3f46", color: "white", resize: "none", borderRadius: 8 }}
        />
      </div>

      <div>
        <Text strong style={{ display: "block", color: "#e4e4e7", marginBottom: 8 }}>
          Banner image{" "}
          <Text style={{ color: "#71717a", fontWeight: 400, fontSize: "0.85rem" }}>(optional)</Text>
        </Text>
        {formData.bannerUrl && (
          <div
            style={{
              width: "100%",
              height: 88,
              borderRadius: 8,
              background: `url(${formData.bannerUrl}) center/cover no-repeat`,
              border: "1px solid #3f3f46",
              marginBottom: 8,
            }}
          />
        )}
        <Input
          value={formData.bannerUrl}
          onChange={event => updateField("bannerUrl", event.target.value)}
          placeholder="https://example.com/banner.png"
          style={{ background: "#27272a", borderColor: "#3f3f46", color: "white", borderRadius: 8 }}
        />
      </div>
    </div>
  );
}
