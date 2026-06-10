import { Button, Col, Divider, Input, Row, Select, Typography } from "antd";
import type { DashboardBackgroundPreference } from "../../routes/dashboard/layout";
import type { DashboardBackgroundSearchResult } from "./types";

const { Text } = Typography;

type BackgroundCustomizerProps = {
  backgroundPreference: DashboardBackgroundPreference;
  collectionConfigured: boolean;
  collectionLabel?: string;
  onResetBackgroundPreference: () => void;
  onBackgroundPositionChange: (position: string) => void;
  backgroundOptions: DashboardBackgroundSearchResult[];
  backgroundOptionsLoading: boolean;
  backgroundOptionsError: string;
  onApplyUnsplashBackground: (photo: DashboardBackgroundSearchResult) => Promise<void> | void;
};

export function BackgroundCustomizer({
  backgroundPreference,
  collectionConfigured,
  collectionLabel,
  onResetBackgroundPreference,
  onBackgroundPositionChange,
  backgroundOptions,
  backgroundOptionsLoading,
  backgroundOptionsError,
  onApplyUnsplashBackground,
}: BackgroundCustomizerProps) {
  return (
    <>
      <Divider style={{ margin: "24px 0", borderColor: "rgba(255,255,255,0.05)" }} />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap" }}>
        <div>
          <Text strong style={{ color: "white", display: "block" }}>
            Dashboard background
          </Text>
          <Text type="secondary" style={{ fontSize: "0.75rem" }}>
            Saved locally for now. This can move to the database with layout settings later.
          </Text>
        </div>
        <Button size="small" onClick={onResetBackgroundPreference} style={{ background: "transparent", borderColor: "rgba(255,255,255,0.12)" }}>
          Reset default
        </Button>
      </div>

      <div
        style={{
          height: 140,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          background: `linear-gradient(180deg, rgba(10,10,14,0.08) 0%, rgba(10,10,14,0.62) 100%), url('${backgroundPreference.previewUrl || backgroundPreference.imageUrl}') ${backgroundPreference.position} / cover no-repeat`,
          marginBottom: 16,
          display: "flex",
          alignItems: "flex-end",
          padding: 14,
        }}
      >
        <div>
          <Text strong style={{ color: "white", display: "block" }}>
            {backgroundPreference.label}
          </Text>
          <Text type="secondary" style={{ fontSize: "0.75rem" }}>
            {backgroundPreference.source === "unsplash"
              ? `Unsplash photo${backgroundPreference.photographerName ? ` by ${backgroundPreference.photographerName}` : ""}`
              : backgroundPreference.source === "manual"
                ? "Custom image URL"
                : "InterChat default background"}
          </Text>
        </div>
      </div>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Text strong style={{ fontSize: "0.8rem", color: "white" }}>
            Image position
          </Text>
          <Select
            value={backgroundPreference.position}
            onChange={onBackgroundPositionChange}
            style={{ width: "100%", marginTop: 8 }}
            options={[
              { label: "Center top", value: "center top" },
              { label: "Center center", value: "center center" },
              { label: "Top center", value: "top center" },
              { label: "Bottom center", value: "bottom center" },
            ]}
          />
        </Col>
        <Col xs={24} md={12}>
          <Text strong style={{ fontSize: "0.8rem", color: "white" }}>
            Source
          </Text>
          <Input value={backgroundPreference.source} readOnly style={{ marginTop: 8, background: "rgba(0,0,0,0.3)", border: "1px solid #2d2d34", textTransform: "capitalize" }} />
        </Col>
      </Row>

      {backgroundPreference.photographerUrl && backgroundPreference.photographerName && (
        <Text type="secondary" style={{ display: "block", fontSize: "0.75rem", marginBottom: 16 }}>
          Photo by <a href={backgroundPreference.photographerUrl} target="_blank" rel="noreferrer" style={{ color: "#c4b5fd" }}>{backgroundPreference.photographerName}</a>
        </Text>
      )}

      <Text strong style={{ color: "white", display: "block" }}>
        Curated backgrounds
      </Text>
      <Text type="secondary" style={{ display: "block", fontSize: "0.75rem", margin: "4px 0 12px" }}>
        {collectionConfigured
          ? `Choose from the fixed Unsplash collection${collectionLabel ? `: ${collectionLabel}` : ""}.`
          : "Add VITE_UNSPLASH_DASHBOARD_COLLECTION_ID and VITE_UNSPLASH_ACCESS_KEY to enable curated dashboard backgrounds."}
      </Text>

      {backgroundOptionsLoading && (
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          Loading collection backgrounds...
        </Text>
      )}

      {backgroundOptionsError && (
        <Text type="secondary" style={{ display: "block", color: "#fda4af", marginBottom: 12 }}>
          {backgroundOptionsError}
        </Text>
      )}

      {backgroundOptions.length > 0 && (
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          {backgroundOptions.map((photo) => (
            <Col xs={24} md={12} key={photo.id}>
              <button
                type="button"
                onClick={() => void onApplyUnsplashBackground(photo)}
                style={{ width: "100%", padding: 0, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden", background: "rgba(0,0,0,0.2)", cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ height: 100, background: `url('${photo.previewUrl}') center / cover no-repeat` }} />
                <div style={{ padding: 12 }}>
                  <Text strong style={{ color: "white", display: "block" }}>
                    {photo.label}
                  </Text>
                  <Text type="secondary" style={{ fontSize: "0.75rem" }}>
                    by {photo.photographerName}
                  </Text>
                </div>
              </button>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}