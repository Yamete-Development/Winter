import { GlobalOutlined, LockOutlined, MessageOutlined } from "@ant-design/icons";
import { Tag, Typography } from "antd";
import type { HubFormValues } from "./types";

const { Paragraph, Text, Title } = Typography;

type ReviewStepProps = {
  formData: HubFormValues;
};

export function ReviewStep({ formData }: ReviewStepProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 600 }}>
      <div style={{ borderRadius: 8, background: "#27272a", border: "1px solid #3f3f46", overflow: "hidden" }}>
        {/* Banner */}
        <div
          style={{
            height: 88,
            background: formData.bannerUrl
              ? `url(${formData.bannerUrl}) center/cover no-repeat`
              : "#3f3f46",
            position: "relative",
          }}
        >
          {/* Icon overlapping banner */}
          <div
            style={{
              position: "absolute",
              bottom: -28,
              left: 20,
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: formData.iconUrl
                ? `url(${formData.iconUrl}) center/cover no-repeat`
                : "#18181b",
              border: "3px solid #27272a",
              overflow: "hidden",
            }}
          />
        </div>
        <div style={{ padding: "36px 20px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <Text style={{ display: "block", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.72rem", fontWeight: 600 }}>
                Hub preview
              </Text>
              <Title level={4} style={{ margin: "4px 0 0", color: "white" }}>
                {formData.name || "Your new hub"}
              </Title>
            </div>
            <Tag color="purple" style={{ margin: 0, borderRadius: 4, background: "rgba(124, 58, 237, 0.1)", border: "1px solid rgba(124, 58, 237, 0.3)", color: "#c4b5fd" }}>
              {formData.visibility}
            </Tag>
          </div>

          <Paragraph style={{ margin: 0, color: "#e4e4e7" }}>
            {formData.shortDescription || "Add a sharp summary so communities know what this hub is for."}
          </Paragraph>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Tag style={{ margin: 0, borderRadius: 4, background: "#3f3f46", color: "#f4f4f5" }}>
              {formData.language}
            </Tag>
            <Tag style={{ margin: 0, borderRadius: 4, background: "#3f3f46", color: "#f4f4f5" }}>
              {formData.region}
            </Tag>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div style={{ padding: 20, borderRadius: 8, background: "#18181b", border: "1px solid #27272a" }}>
          <GlobalOutlined style={{ color: "#a78bfa", fontSize: 20 }} />
          <Text strong style={{ display: "block", color: "white", marginTop: 12, marginBottom: 4 }}>
            Discovery ready
          </Text>
          <Text style={{ color: "#a1a1aa", fontSize: "0.8rem", lineHeight: 1.4 }}>
            Visibility and region are set before the first community joins.
          </Text>
        </div>
        <div style={{ padding: 20, borderRadius: 8, background: "#18181b", border: "1px solid #27272a" }}>
          <MessageOutlined style={{ color: "#a78bfa", fontSize: 20 }} />
          <Text strong style={{ display: "block", color: "white", marginTop: 12, marginBottom: 4 }}>
            Tone prepared
          </Text>
          <Text style={{ color: "#a1a1aa", fontSize: "0.8rem", lineHeight: 1.4 }}>
            The welcome copy is ready for the first guild connection.
          </Text>
        </div>
        <div style={{ padding: 20, borderRadius: 8, background: "#18181b", border: "1px solid #27272a" }}>
          <LockOutlined style={{ color: "#a78bfa", fontSize: 20 }} />
          <Text strong style={{ display: "block", color: "white", marginTop: 12, marginBottom: 4 }}>
            Safe defaults
          </Text>
          <Text style={{ color: "#a1a1aa", fontSize: "0.8rem", lineHeight: 1.4 }}>
            The hub starts unlocked and ready for moderation tuning.
          </Text>
        </div>
      </div>
    </div>
  );
}
