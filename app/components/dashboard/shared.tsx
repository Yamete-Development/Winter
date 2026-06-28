import type { CSSProperties, ReactNode } from "react";
import { Card, Typography } from "antd";
import type { CardProps } from "antd";

const { Text } = Typography;

export const dashboardGlassCardStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: "rgba(20, 20, 25, 0.4)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const dashboardGlassCardStyles: NonNullable<CardProps["styles"]> = {
  header: { borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "grab" },
  body: { flex: 1, overflowY: "auto" },
};

export function DashboardSectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
      {children}
    </Text>
  );
}

export function DashboardSectionCard({ style, styles, ...props }: CardProps) {
  return (
    <Card
      variant="borderless"
      style={{ ...dashboardGlassCardStyle, ...style }}
      styles={{ ...dashboardGlassCardStyles, ...styles }}
      {...props}
    />
  );
}

export function DashboardDangerCard({ style, styles, ...props }: CardProps) {
  return (
    <Card
      variant="borderless"
      style={{
        ...dashboardGlassCardStyle,
        background: "rgba(245, 34, 45, 0.05)",
        border: "1px solid rgba(245, 34, 45, 0.2)",
        ...style,
      }}
      styles={{
        ...dashboardGlassCardStyles,
        header: { borderBottom: "1px solid rgba(245, 34, 45, 0.2)", cursor: "grab" },
        ...styles,
      }}
      {...props}
    />
  );
}