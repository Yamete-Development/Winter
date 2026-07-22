import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("routes/_marketing/layout.tsx", [
    index("routes/_marketing/index.tsx")
  ]),
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route("dashboard/inbox", "routes/dashboard/inbox.tsx"),
    route("dashboard/hubs", "routes/dashboard/hubs.tsx"),
    route("dashboard/hubs/:hubId/:view?", "routes/dashboard/hub-workspace.tsx"),
    route("dashboard/servers", "routes/dashboard/servers.tsx"),
    route("dashboard/servers/:serverId/:view?", "routes/dashboard/server-workspace.tsx"),
    route("dashboard/settings", "routes/dashboard/settings.tsx"),
  ]),
  layout("routes/staff/layout.tsx", [
    route("staff", "routes/staff/index.tsx"),
    route("staff/relationships", "routes/staff/relationships.tsx"),
    route("staff/analytics", "routes/staff/analytics.tsx")
  ]),
  route("auth/discord", "routes/auth/discord.tsx"),
  route("auth/discord/callback", "routes/auth/callback.tsx"),
  route("auth/logout", "routes/auth/logout.tsx"),
  route("api/v1/auth/sse", "routes/api/v1/auth.sse.tsx"),
  route("api/beacon/token", "routes/api/beacon/token.tsx"),
  route("api/webhooks/topgg", "routes/api/webhooks/topgg.tsx"),
  route("api/v1/*", "routes/api/v1/$.tsx")
] satisfies RouteConfig;
