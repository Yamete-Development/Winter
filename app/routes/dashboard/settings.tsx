import { useEffect, useState } from "react";
import { createApi } from "unsplash-js";
import { Card, Col, Row, Typography, message } from "antd";
import { BackgroundCustomizer } from "../../components/dashboard/BackgroundCustomizer";
import { DashboardSectionTitle } from "../../components/dashboard/shared";
import type { DashboardBackgroundSearchResult } from "../../components/dashboard/types";
import type { DashboardBackgroundPreference, DashboardLayoutContext } from "./layout";
import { useOutletContext } from "react-router";

const { Title, Text } = Typography;

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY?.trim();
const DASHBOARD_COLLECTION_ID = import.meta.env.VITE_UNSPLASH_DASHBOARD_COLLECTION_ID?.trim();
const DASHBOARD_COLLECTION_LABEL = import.meta.env.VITE_UNSPLASH_DASHBOARD_COLLECTION_LABEL?.trim();
const unsplash = UNSPLASH_ACCESS_KEY ? createApi({ accessKey: UNSPLASH_ACCESS_KEY }) : null;

function withUnsplashReferral(url: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}utm_source=interchat_web&utm_medium=referral`;
}

export default function DashboardSettingsPage() {
  const { backgroundPreference, updateBackgroundPreference, resetBackgroundPreference } = useOutletContext<DashboardLayoutContext>();
  const [backgroundOptions, setBackgroundOptions] = useState<DashboardBackgroundSearchResult[]>([]);
  const [backgroundOptionsLoading, setBackgroundOptionsLoading] = useState(false);
  const [backgroundOptionsError, setBackgroundOptionsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCollectionPhotos() {
      if (!unsplash || !DASHBOARD_COLLECTION_ID) {
        setBackgroundOptions([]);
        setBackgroundOptionsError("Dashboard background collection is not configured.");
        return;
      }

      setBackgroundOptionsLoading(true);
      setBackgroundOptionsError("");

      try {
        const result = await unsplash.GET("/collections/{collectionId}/photos", {
          params: {
            path: { collectionId: DASHBOARD_COLLECTION_ID },
            query: {
              page: 1,
              per_page: 12,
              orientation: "landscape",
            },
          },
        });

        if (cancelled) {
          return;
        }

        if (result.error || !result.data) {
          setBackgroundOptions([]);
          setBackgroundOptionsError("Unable to load the dashboard background collection.");
          return;
        }

        setBackgroundOptions(
          result.data.map((photo) => ({
            id: photo.id,
            imageUrl: photo.urls.regular,
            previewUrl: photo.urls.small,
            thumbUrl: photo.urls.thumb,
            label: photo.description || `${DASHBOARD_COLLECTION_LABEL || "Collection photo"} by ${photo.user.name}`,
            photographerName: photo.user.name,
            photographerUrl: withUnsplashReferral(photo.user.links.html),
            downloadLocation: photo.links.download_location,
          })),
        );
      } catch {
        if (!cancelled) {
          setBackgroundOptions([]);
          setBackgroundOptionsError("Unable to load the dashboard background collection.");
        }
      } finally {
        if (!cancelled) {
          setBackgroundOptionsLoading(false);
        }
      }
    }

    void loadCollectionPhotos();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleApplyUnsplashBackground = async (photo: DashboardBackgroundSearchResult) => {
    const nextPreference: DashboardBackgroundPreference = {
      version: 1,
      source: "unsplash",
      imageUrl: photo.imageUrl,
      previewUrl: photo.previewUrl,
      label: photo.label,
      description: DASHBOARD_COLLECTION_LABEL
        ? `Unsplash collection: ${DASHBOARD_COLLECTION_LABEL}`
        : `Unsplash collection ${DASHBOARD_COLLECTION_ID}`,
      photographerName: photo.photographerName,
      photographerUrl: photo.photographerUrl,
      unsplashId: photo.id,
      unsplashQuery: DASHBOARD_COLLECTION_ID,
      downloadLocation: photo.downloadLocation,
      position: backgroundPreference.position,
      opacity: backgroundPreference.opacity,
      appliedAt: new Date().toISOString(),
    };

    updateBackgroundPreference(nextPreference);
    message.success("Dashboard background updated.");

    if (unsplash && photo.downloadLocation) {
      try {
        await unsplash.GET("/photos/{id}/download", {
          params: {
            path: { id: photo.id },
          },
        });
      } catch {
        // Ignore download tracking failures.
      }
    }
  };

  const handleBackgroundPositionChange = (position: string) => {
    updateBackgroundPreference({
      ...backgroundPreference,
      position,
      appliedAt: new Date().toISOString(),
    });
  };

  return (
    <div style={{ paddingTop: 24, paddingRight: 12, paddingBottom: 24, minHeight: 0 }}>
      <div style={{ marginBottom: 20 }}>
        <Text style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          InterChat Preferences
        </Text>
        <Title level={2} style={{ margin: 0, color: "white", lineHeight: 1.1 }}>
          Dashboard Settings
        </Title>
        <Text type="secondary" style={{ fontSize: "0.95rem" }}>
          Configure dashboard-wide appearance and local preferences outside any individual hub.
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <Card
            title={<DashboardSectionTitle>Dashboard Background</DashboardSectionTitle>}
            variant="borderless"
            styles={{ header: { borderBottom: "1px solid rgba(255,255,255,0.05)" }, body: { flex: 1, overflowY: "auto" } }}
            style={{ width: "100%", background: "rgba(20, 20, 25, 0.4)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <BackgroundCustomizer
              backgroundPreference={backgroundPreference}
              collectionConfigured={Boolean(UNSPLASH_ACCESS_KEY && DASHBOARD_COLLECTION_ID)}
              collectionLabel={DASHBOARD_COLLECTION_LABEL}
              onResetBackgroundPreference={resetBackgroundPreference}
              onBackgroundPositionChange={handleBackgroundPositionChange}
              backgroundOptions={backgroundOptions}
              backgroundOptionsLoading={backgroundOptionsLoading}
              backgroundOptionsError={backgroundOptionsError}
              onApplyUnsplashBackground={handleApplyUnsplashBackground}
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card
            title={<DashboardSectionTitle>How It Works</DashboardSectionTitle>}
            variant="borderless"
            styles={{ header: { borderBottom: "1px solid rgba(255,255,255,0.05)" } }}
            style={{ width: "100%", background: "rgba(20, 20, 25, 0.4)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
              Background choices here are dashboard-wide and saved locally for now.
            </Text>
            <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
              The image picker reads from a fixed Unsplash collection using Vite env vars instead of free-form user search.
            </Text>
            <Text type="secondary" style={{ display: "block" }}>
              Configure `VITE_UNSPLASH_ACCESS_KEY` and `VITE_UNSPLASH_DASHBOARD_COLLECTION_ID` to control which images users can choose from.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}