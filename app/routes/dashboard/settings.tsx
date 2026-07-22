import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Segmented } from "antd";
import { useEffect, useState } from "react";
import { PageHeader, Section } from "~/components/dashboard/WorkspacePrimitives";

type ThemeChoice = "system" | "night" | "paper";

function resolvedTheme(choice: ThemeChoice) {
  if (choice !== "system") return choice;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "paper";
}

export default function DashboardSettings() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  useEffect(() => {
    const stored = localStorage.getItem("interchat-dashboard-theme-choice");
    if (stored === "night" || stored === "paper" || stored === "system") setChoice(stored);
  }, []);
  const update = (value: ThemeChoice) => {
    setChoice(value);
    localStorage.setItem("interchat-dashboard-theme-choice", value);
    const resolved = resolvedTheme(value);
    localStorage.setItem("interchat-dashboard-theme", resolved);
    document.documentElement.dataset.dashboardTheme = resolved;
    window.dispatchEvent(new CustomEvent("interchat-dashboard-theme", { detail: resolved }));
  };
  return <>
    <PageHeader eyebrow="Preferences" title="Appearance" description="Choose the dashboard contrast that works best for your environment." />
    <Section title="Theme">
      <div className="dashboard-form"><div className="dashboard-field"><label htmlFor="theme-choice">Dashboard theme</label><Segmented id="theme-choice" value={choice} options={[{ label: "System", value: "system" }, { label: <span><MoonOutlined /> Night</span>, value: "night" }, { label: <span><SunOutlined /> Paper</span>, value: "paper" }]} onChange={(value) => update(value as ThemeChoice)} /></div></div>
    </Section>
  </>;
}
