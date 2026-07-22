import type { Route } from "./+types/index";
import { MarketingHeader } from "../../components/MarketingHeader";
import {
  CallsSection,
  ControlSection,
  FinaleSection,
  HeroSection,
  HubsSection,
  MarketingFooter,
  RelaySection,
  SafetySection,
} from "../../components/marketing";
import "../../styles/marketing.css";

export function meta({}: Route.MetaArgs) {
  const title = "InterChat — Connect Discord communities";
  const description =
    "Link Discord servers through shared Hubs and spontaneous text Calls, with safety and community control built into every connection.";

  return [
    { title },
    { name: "description", content: description },
    { name: "theme-color", content: "#19172B" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:image", content: "/images/interchat-atlas-card.png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export default function MarketingIndex() {
  return (
    <div className="marketing-page">
      <MarketingHeader />
      <main>
        <HeroSection />
        <RelaySection />
        <HubsSection />
        <CallsSection />
        <ControlSection />
        <SafetySection />
        <FinaleSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
