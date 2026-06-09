import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("routes/_marketing/layout.tsx", [
    index("routes/_marketing/index.tsx")
  ]),
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx")
  ]),
  layout("routes/staff/layout.tsx", [
    route("staff", "routes/staff/index.tsx"),
    route("staff/relationships", "routes/staff/relationships.tsx"),
    route("staff/analytics", "routes/staff/analytics.tsx")
  ]),
  route("auth/discord", "routes/auth/discord.tsx"),
  route("auth/discord/callback", "routes/auth/callback.tsx"),
  route("auth/logout", "routes/auth/logout.tsx")
] satisfies RouteConfig;
