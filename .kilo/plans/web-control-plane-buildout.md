# InterChat Web Control Plane — Full Build-Out Plan

## Architecture Principles (from AGENTS.md)

- **Resource-oriented**: Every configurable entity is `{ metadata, spec, status }`
- **Relationships are resources**: `HubServerLink`, `ModerationAssignment`, etc.
- **Never persist effective configuration**: Always compute it
- **Services own business logic**: Routes only orchestrate UI
- **One ORPC procedure = one responsibility**
- **Shared validation schemas**: Used by ORPC, forms, and services
- **Permission checks via service**: Never `user.role === "admin"` in UI
- **Full compliance**: New code follows all AGENTS.md rules; existing code refactored where touched

## Build Order Priority

1. Wire stubs and complete partially-built features first
2. Then add new resource types and ORPC routers
3. Staff dashboard deferred to later phases

---

## Phase 1: Complete Stubs & Core Hub Management

### 1.1 — Wire Up Connection Management
**Files**: `app/services/connection.server.ts`, `app/rpc/routers/hub.ts`, `app/routes/dashboard/index.tsx`

- Add `toggleConnection`, `disconnectConnection`, `createConnection` to `connectionService`
- Add corresponding ORPC procedures to `hubRouter`:
  - `toggleConnection(hubId, connectionId, enabled)` → UPDATE `connection.connected`
  - `disconnectConnection(hubId, connectionId)` → DELETE or set `connected=false` + `pausedByBot=true`
  - `createConnection(hubId, channelId, serverId)` → INSERT new connection row
- Wire the stub handlers in `HubConnectionsPanel` (connections tab) to call these procedures via `orpc.hub.toggleConnection`, etc.
- Add optimistic updates via `useMutation` with `onMutate`/`onError` rollback

### 1.2 — Wire Up Chat Sending in SSE Feed
**Files**: `app/routes/dashboard/index.tsx`, `app/rpc/routers/hub.ts`, `app/services/message.server.ts`

- Add `sendMessage(hubId, content, authorId)` to `messageService` → INSERT into `message` table
- Add `sendMessage` ORPC procedure to `hubRouter`
- Wire the chat input's send handler to call `orpc.hub.sendMessage.mutate()`
- Messages should appear immediately in the SSE feed via react-query cache invalidation

### 1.3 — Wire Up Danger Zone Operations
**Files**: `app/services/hub.server.ts`, `app/rpc/routers/hub.ts`, `app/routes/dashboard/index.tsx`

- Add to `hubService`:
  - `deleteHub(userId, hubId)` — permission check `ADMINISTRATOR`, then DELETE hub (cascades)
  - `transferOwnership(userId, hubId, newOwnerId)` — update `hub.ownerId`
  - `nukeHubMessages(userId, hubId)` — DELETE all messages WHERE `hubId` = X
- Add ORPC procedures: `deleteHub`, `transferOwnership`, `nukeMessages`
- Wire the Danger Zone panel buttons to these mutations with confirmation dialogs
- After delete, redirect to `/dashboard` (or show empty state)

### 1.4 — Full Hub Settings Bitfield Management
**Files**: `app/schemas/hub.ts`, `app/services/hub.server.ts`, `app/rpc/routers/hub.ts`, new component

The bot uses an IntFlag `HubSettings` bitfield on `hub.settings`. Only `nsfw`, `locked`, `appealCooldownHours`, and `welcomeMessage` are currently patchable.

- Define `HubSettingsFlags` enum matching the bot:
  ```ts
  REACTIONS = 1, HIDE_LINKS = 2, SPAM_FILTER = 4, BLOCK_INVITES = 8,
  USE_NICKNAMES = 16, BLOCK_NSFW = 32, ALLOW_VIDEOS = 64,
  BLOCK_ATTACHMENTS = 128, BLOCK_TENOR_GIFS = 256
  ```
- Extend `patchHubConfigSchema` with optional `settings` field (integer bitmask)
- Extend `hubService.updateHubConfig` to support `settings` bitfield updates
- Add `HubSettings` bitfield to `HubSpec` in `app/resources/hub.ts`
- Create `HubSettingsPanel` component with toggle switches for each flag, reading/writing the bitmask
- Place in the "General" tab grid

### 1.5 — Make Batch Automod Updates Atomic
**Files**: `app/services/moderation.server.ts`

- Replace current "delete all + re-insert" with a transactional UPSERT pattern:
  - Begin transaction
  - For each rule in the batch: `INSERT ... ON CONFLICT (hubId, name) DO UPDATE`
  - Delete rules NOT in the batch (orphaned by removal)
  - Commit transaction
- This prevents data loss if the request fails mid-way

### 1.6 — Sync Dashboard Background Preference to Server
**Files**: `app/services/hub.server.ts`, `app/routes/dashboard/settings.tsx`, `drizzle/schema.ts`

- Add `backgroundUrl` column to `hub` table (or a new `UserPreference` table for dashboard settings)
- Create `patchDashboardPreferences` ORPC procedure
- Replace `localStorage` read/write with server-synced preference + localStorage as cache

### 1.7 — Fix Dockerfile for Bun Runtime
**Files**: `Dockerfile`

- Replace Node.js base image with `oven/bun:1` 
- Replace `npm install` with `bun install`
- Update CMD to use `bun run server.ts`

---

## Phase 2: Hub Advanced Features

### 2.1 — Hub Rules CRUD
**Files**: New `app/services/rules.server.ts`, new `app/rpc/routers/rules.ts`, new component

`hub.rules` is a `text[]` column. Currently not editable in the web UI.

- Create `hubRulesService`:
  - `getRules(hubId)` → returns `string[]`
  - `updateRules(hubId, rules: string[])` → permission check `MANAGE_RULES`, then UPDATE
  - `addRule(hubId, rule: string)` → append to array
  - `removeRule(hubId, index: number)` → splice from array
  - `reorderRules(hubId, fromIndex, toIndex)` → reorder array
- Create ORPC `rulesRouter` with procedures for each operation
- Create `HubRulesPanel` component with editable list + add/remove/reorder controls
- Place in the "General" or a new "Rules" tab

### 2.2 — Hub Announcements CRUD
**Files**: New `app/services/announcements.server.ts`, new component

Table `hubAnnouncement` already exists (id, hubId, title, content, frequencyMs, imageUrl, etc.)

- Create `announcementService`:
  - `getAnnouncements(hubId)` — list all announcements for a hub
  - `createAnnouncement(hubId, input)` — INSERT
  - `updateAnnouncement(announcementId, input)` — UPDATE
  - `deleteAnnouncement(announcementId)` — DELETE
- Create ORPC `announcementRouter`
- Create `HubAnnouncementsPanel` with create/edit/delete, frequency picker (hourly, daily, weekly), preview

### 2.3 — Hub Leaderboards
**Files**: New `app/services/leaderboard.server.ts`, new component

Tables `hubUserStats` and `hubServerStats` track per-month message counts.

- Create `leaderboardService`:
  - `getUserLeaderboard(hubId, period: 'monthly' | 'allTime')` → top users by message count
  - `getServerLeaderboard(hubId, period: 'monthly' | 'allTime')` → top servers by message count
- Create ORPC `leaderboardRouter`
- Create `HubLeaderboardPanel` with toggle between user/server and monthly/all-time

### 2.4 — Hub Audit Log Viewer
**Files**: New `app/services/audit.server.ts`, new component

The bot already has an `auditService` that writes `AuditEvent` rows (hubId, eventType, details JSONB, etc.). The web needs a read-only viewer.

- Create `auditLogService`:
  - `getAuditLogs(hubId, filters?)` — paginated query with type/date filters
- Create ORPC `auditRouter`
- Create `HubAuditLogPanel` with timeline/list view, pagination, and event-type filters
- Place in a new "Audit Log" tab (permission-gated: `VIEW_LOGS`)

### 2.5 — Hub Invite Management
**Files**: New `app/services/invite.server.ts`, new component

Table `hubInvite` exists (code, hubId, expires, maxUses, uses).

- Create `inviteService`:
  - `getInvites(hubId)` — list all invites
  - `createInvite(hubId, maxUses?, expires?)` — generate unique code, INSERT
  - `revokeInvite(code)` — DELETE
- Create ORPC `inviteRouter`
- Create `HubInvitePanel` with list + create + revoke, showing usage counts and expiry

---

## Phase 3: Moderation & Safety Deep Dive

### 3.1 — Full Moderation Panel (Infraction Management)
**Files**: `app/services/moderation.server.ts`, `app/rpc/routers/moderation.ts`, new component

Currently only `getRecentInfractions` exists. Need full CRUD.

- Extend `moderationService`:
  - `createInfraction(hubId, input)` — permission check `MODERATE_MESSAGES`, INSERT into `infraction`
  - `revokeInfraction(infractionId, moderatorId)` — UPDATE status to `REVOKED`
  - `getInfractionDetail(infractionId)` — full detail with evidence fields
  - `getUserInfractions(hubId, userId)` — all infractions for a user in a hub
- Add ORPC procedures: `createInfraction`, `revokeInfraction`, `getInfractionDetail`, `getUserInfractions`
- Create `ModerationPanel` component (replaces or enhances current grid panels):
  - Infraction history table with filters (type, status, date range)
  - "Create Infraction" modal with type selector, reason, duration (for mutes/bans), evidence fields
  - Revoke button with confirmation
  - User detail view showing all infractions for a user

### 3.2 — Appeal Management
**Files**: New `app/services/appeal.server.ts`, new component

Table `appeal` exists (infractionId, userId, reason, status).

- Create `appealService`:
  - `getPendingAppeals(hubId)` — list PENDING appeals
  - `getAppealDetail(appealId)` — full detail with infraction context
  - `acceptAppeal(appealId, moderatorId)` — UPDATE status to ACCEPTED, optionally revoke infraction
  - `rejectAppeal(appealId, moderatorId)` — UPDATE status to REJECTED
- Create ORPC `appealRouter`
- Create `AppealManagementPanel` with queue list, accept/reject buttons, detail view showing infraction + appeal reason

### 3.3 — Escalation Rules CRUD
**Files**: New `app/services/escalation.server.ts`, new component

Table `autoModEscalationRule` exists (threshold, windowMinutes, action, duration, enabled).

- Create `escalationService`:
  - `getEscalationRules(hubId)` — list rules
  - `createEscalationRule(hubId, input)` — INSERT
  - `updateEscalationRule(ruleId, input)` — UPDATE
  - `deleteEscalationRule(ruleId)` — DELETE
- Create ORPC procedures
- Create `EscalationRulesPanel` with rule list + add/edit form: threshold slider, window dropdown, action picker, duration input, enabled toggle

### 3.4 — Global AutoMod Packs Browser
**Files**: `app/services/moderation.server.ts`, new component

`automodRule` rows with `isGlobal=true` are staff-curated packs that servers can enable/disable via `serverAutomodRuleState`.

- Extend `moderationService`:
  - `getGlobalAutomodPacks()` — list rules WHERE `isGlobal = true`
  - `getServerAutomodRuleStates(hubId)` — query `ServerAutomodRuleState` join
  - `toggleGlobalPack(hubId, ruleId, enabled)` — UPSERT `serverAutomodRuleState`
- Create read-only browser component showing available global packs with enable/disable toggles

### 3.5 — NSFW Review Queue
**Files**: New `app/services/nsfwReview.server.ts`, new component

Tables `nsfwReviewQueue` and `nsfwOverride` exist.

- Create `nsfwReviewService`:
  - `getReviewQueue(hubId, status?)` — paginated list
  - `getReviewItem(itemId)` — full detail with image URL, scores, hashes
  - `markSafe(itemId, moderatorId)` — UPDATE status, INSERT `nsfwOverride` with `isSafe=true`
  - `markUnsafe(itemId, moderatorId)` — UPDATE status, INSERT `nsfwOverride` with `isSafe=false`
- Create ORPC `nsfwReviewRouter`
- Create `NsfwReviewPanel` with image grid, score display, safe/unsafe action buttons

### 3.6 — Whitelist Management
**Files**: New `app/services/whitelist.server.ts`, new component

Table `automodWhitelist` exists (ruleId, word, reason).

- Create `whitelistService`:
  - `getWhitelist(ruleId)` — list whitelist entries for a rule
  - `addWhitelist(ruleId, word, reason)` — INSERT
  - `removeWhitelist(entryId)` — DELETE
- Create ORPC procedures
- Extend `BlockedWordsManager` with a "Whitelist" sub-tab or integrate into AutoMod rule editor

---

## Phase 4: Server Resources & Architecture Foundation

### 4.1 — Server Resource Type
**Files**: New `app/resources/server.ts`, new schemas, services, router

The bot manages `ServerData` rows with config fields. The web needs a proper resource type.

- Create `ServerResource` type:
  ```ts
  type ServerResource = {
    metadata: { id, name, createdAt, updatedAt };
    spec: {
      prefix, inviteCode, hideServerName, pingOnMatch,
      autoRequeueOnSkip, autoRequeueOnHangup, filterNsfw
    };
    status: { messageCount, callCount, lastMessageAt, iconUrl };
  };
  ```
- Create `patchServerConfigSchema` (zod)
- Create `serverService`:
  - `getServer(serverId)` — single server detail
  - `getUserServers(userId)` — servers the user manages (via connections)
  - `updateServerConfig(serverId, input)` — patch userphone/flags
- Create ORPC `serverRouter`

### 4.2 — Userphone Settings Panel
**Files**: New component, extends server router

- Create `UserphoneSettingsPanel` component:
  - Toggles for: hideServerName, pingOnMatch, autoRequeueOnSkip, autoRequeueOnHangup, filterNsfw
  - Uses the `serverRouter.patchConfig` procedure
- Place in a new "Server Settings" tab (or within server detail page)

### 4.3 — Server Blocklist Management
**Files**: New `app/services/serverBlocklist.server.ts`, new component

Table `serverBlocklist` exists. Each server can block users or other servers.

- Create `serverBlocklistService`:
  - `getBlocklist(serverId)` — list blocked entries with names
  - `addBlock(serverId, blockedUserId?, blockedServerId?, reason)` — INSERT
  - `removeBlock(blockId)` — DELETE
- Create ORPC procedures
- Create `ServerBlocklistPanel` with add/remove, showing blocked user/server names

### 4.4 — HubServerLink as Formal Relationship Resource
**Files**: `app/resources/connection.ts` (extend), `app/services/connection.server.ts` (extend)

- Rename `HubConnectionResource` → `HubServerLinkResource` (or create alias)
- Add relationship metadata: `{ sourceResourceType: "Hub", sourceResourceId, targetResourceType: "Server", targetResourceId }`
- Ensure all connection mutations go through a single `linkService` / `connectionService`
- Add `createdBy` and audit trail for link/unlink operations

### 4.5 — ModerationAssignment as Formal Relationship Resource
**Files**: New `app/resources/moderationAssignment.ts`, extend `app/services/hubStaff.server.ts`

- Create `ModerationAssignmentResource` type:
  ```ts
  { metadata: { id, createdAt }, spec: { hubId, userId, role, assignedBy }, status: { active } }
  ```
- Refactor `hubStaffService` to return this resource type
- Add `assignedBy` tracking on all role assignments

### 4.6 — Audit Event Infrastructure
**Files**: New `app/services/auditEvent.server.ts`, extend all mutation services

- Define `AuditEvent` schema:
  ```ts
  { id, hubId, userId, eventType, details: JSONB, createdAt }
  ```
- Create `auditEventService.emit(event)` function
- Integrate emission into all existing mutations:
  - Hub: created, updated, deleted, ownership transferred
  - Connection: linked, unlinked, toggled
  - Moderation: infraction created, revoked; appeal accepted, rejected
  - Staff: role assigned, removed
  - AutoMod: rules updated, whitelist changed
  - Settings: bitfield changed
- Events are INSERT-only; no mutation should fail if audit logging fails (fire-and-forget or separate try/catch)

### 4.7 — Effective Configuration Resolver
**Files**: New `app/services/effectiveConfig.server.ts`

Per AGENTS.md: "Never persist effective configuration. Always compute it."

- Create `resolveEffectiveServerConfig(serverId)`:
  - Reads server's own config
  - Reads all inherited AutoMod rules (global packs + hub-level rules)
  - Reads escalation rules
  - Merges and returns effective configuration
- Used by the dashboard to show "what's actually active" vs "what's configured"
- Cache in Redis with short TTL, invalidated on any source config change

### 4.8 — Command/Query Separation
**Files**: Refactor service layer

- Split each service into `*Service.queries` and `*Service.commands` (or separate files)
- `queries` are read-only, never mutate
- `commands` perform mutations and return results
- This is a refactoring pass, not new functionality

---

## Phase 5: Reporting & User Features

### 5.1 — Hub Report Management
**Files**: New `app/services/report.server.ts`, new components

Tables `hubReport` and `globalReport` exist.

- Create `reportService`:
  - `getHubReports(hubId, status?, page?)` — paginated list
  - `getReportDetail(reportId)` — full detail with reporter/reported/message info
  - `handleReport(reportId, handlerId, status, actionTaken)` — UPDATE
- Create ORPC `reportRouter`
- Create `HubReportsPanel` with queue table (filters by status), detail modal, and resolve/ignore actions

### 5.2 — Global Report Management (Staff)
**Files**: Extend `reportService`

- `getGlobalReports(status?, page?)` — all platform reports
- Reuses same router and panel but with `global` scope
- Staff-only access (gated via Iris permission check)

### 5.3 — Premium/Subscription Management
**Files**: New `app/services/premium.server.ts`, new components

Tables `premiumKey`, `stripeSubscription`, `giftCode` exist.

- Create `premiumService`:
  - `getUserSubscriptions(userId)` — current subscription status
  - `getPremiumKeys(userId)` — keys owned by user
  - `assignKey(keyId, targetType, targetId)` — assign to hub/user/server
  - `getHubPremiumStatus(hubId)` — which keys are active on a hub
- Create ORPC `premiumRouter`
- Create `PremiumPanel` showing subscription tier, key management, assignment

### 5.4 — User Profile & Preferences Page
**Files**: New `app/services/user.server.ts`, new route `app/routes/dashboard/profile.tsx`

Table `user` has preferences (locale, mentionOnReply, showNsfwHubs, voteReminders, showBadges).

- Create `userService`:
  - `getProfile(userId)` — user + userStats
  - `updatePreferences(userId, input)` — patch user columns
- Create ORPC `userRouter`
- Create profile page route with preference toggles, badge display, stats summary

---

## Phase 6: Analytics, Discovery & Polish

### 6.1 — Hub Analytics Dashboard (Grafana-Style)
**Files**: New `app/services/analytics.server.ts`, new components

Table `hubActivityMetrics` has pre-computed metrics (messages24h/7d, activeUsers, engagementRate, trendingScore).

- Create `analyticsService`:
  - `getHubMetrics(hubId)` — single hub metrics
  - `getHubActivityTimeline(hubId, days?)` — daily breakdown from `hubUserStats`/`hubServerStats`
- Create ORPC `analyticsRouter`
- Create dashboard panels in a new "Analytics" tab:
  - Messages-over-time line chart (recharts or similar)
  - Active users gauge/meter
  - Top servers/users bar chart
  - Engagement rate + trending score cards
  - Connection growth chart
- All panels use glassmorphism card style from `dashboard/shared.tsx`

### 6.2 — Hub Directory / Browse Page
**Files**: New `app/services/discover.server.ts`, new route `app/routes/discover.tsx`

- Create `discoverService`:
  - `listPublicHubs(search?, sort?, page?)` — paginated, filtered by visibility=PUBLIC
  - Sort options: most active, newest, most upvoted, highest rated
  - Search by name, description, tags
- Create `DiscoverPage` route with hub cards grid, search bar, sort dropdown, pagination
- Each hub card shows: name, description, icon, activity level, connection count, rating

### 6.3 — Bot Directory Page
**Files**: New `app/services/bot.server.ts`, new route

Tables `bot` and `botTag` exist.

- Create `botService`:
  - `listApprovedBots(search?, tags?, page?)` — WHERE state = APPROVED
  - `getBotDetail(botId)` — full detail with tags
- Create `BotDirectoryPage` with search, tag filters, bot cards

### 6.4 — Error Boundaries & Loading Skeletons
**Files**: Throughout `app/routes/dashboard/`, `app/components/dashboard/`

- Add per-panel `ErrorBoundary` wrappers that show "Failed to load" state instead of crashing the whole dashboard
- Add loading skeletons for each panel type:
  - `SkeletonCard` — generic card placeholder
  - `SkeletonTable` — table row placeholders
  - `SkeletonChart` — chart area placeholder
- Use these during `isLoading` states in each panel

### 6.5 — Mobile Responsiveness
**Files**: Dashboard layout, sidebar, grid layout

- Make collapsible sidebar a slide-over drawer on mobile (< 768px)
- Adjust react-grid-layout for single-column on mobile
- Make tab bar scrollable horizontally
- Adjust glassmorphism blur performance for mobile (reduce blur radius)

### 6.6 — Pagination for All List Views
**Files**: All list components

- Ensure every list view has cursor-based or offset-based pagination:
  - Connections list
  - Moderation infractions
  - Audit logs
  - Reports
  - Messages
  - Blocked words
  - Escalation rules
  - Leaderboards (top N)
- Standardize pagination component (reuse the same `PaginationBar` component)

### 6.7 — Testing Infrastructure
**Files**: New `tests/` directory, `vitest.config.ts`

- Set up Vitest for unit + integration tests
- Test at minimum:
  - Service layer functions (hub CRUD, permission resolution)
  - ORPC procedure handlers (input validation, error cases)
  - Zod schemas (valid/invalid inputs)
  - Permission bitmask encoding/decoding
- Create test database setup with Docker PostgreSQL

---

## Phase 7: Staff Dashboard (Deferred)

### 7.1 — Wire Real Data to Staff Analytics
- Replace hardcoded stats in `app/routes/staff/index.tsx` with real queries
- Connect to `hubActivityMetrics` aggregation, user counts, server counts

### 7.2 — Relationships Graph
- Implement the placeholder in `app/routes/staff/relationships.tsx`
- Show hub↔server connection graph, staff hierarchy

### 7.3 — Staff Analytics Page
- Implement `app/routes/staff/analytics.tsx`
- Platform-wide metrics: total messages, active users, growth trends

### 7.4 — Global Blacklist Management
- Staff-only UI for managing `blacklist` and `serverBlacklist` tables
- Create/edit/delete global blacklists with evidence

### 7.5 — Dev Announcements Management
- CRUD for `devAlerts` table
- Create announcements that get broadcast to all connected servers

---

## Validation Plan

After each phase:
1. Run `bun run build` — ensure no TypeScript errors
2. Run `bun run dev` — verify new pages load without runtime errors
3. Manual smoke test: create hub → configure → connect → moderate → delete
4. Verify all ORPC procedures return correct types
5. Check permission gating: non-owner should see restricted UI
6. Verify audit events are emitted for all mutations (from Phase 4.6 onward)
7. Verify effective config resolution returns correct merged config

---

## Risks & Open Decisions

1. **Iris AuthZ dependency**: Many procedures will need Iris for permission checks. If Iris is unstable, the web should degrade gracefully (show "Permission check unavailable" instead of crashing).
2. **Discord API rate limits**: Channel name fetching in `discord.server.ts` hits Discord API. Consider batch-fetching or caching channel names in Redis.
3. **SSE connection scaling**: Current SSE implementation for live feed may need Redis pub/sub for multi-instance deployments.
4. **Background sync**: If user has multiple tabs open, preference changes should sync across tabs (use `BroadcastChannel` or Redis pub/sub).
5. **Stripe webhooks**: Premium management reads from Stripe tables populated by the payment service. The web doesn't handle Stripe webhooks directly—ensure this boundary is clear.

---

## Task Execution Order Summary

```
Phase 1 (Stubs & Core):  1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7
Phase 2 (Hub Advanced):  2.1 → 2.2 → 2.3 → 2.4 → 2.5
Phase 3 (Moderation):    3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6
Phase 4 (Servers & Arch): 4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7 → 4.8
Phase 5 (Reports/User):  5.1 → 5.2 → 5.3 → 5.4
Phase 6 (Analytics):     6.1 → 6.2 → 6.3 → 6.4 → 6.5 → 6.6 → 6.7
Phase 7 (Staff):         7.1 → 7.2 → 7.3 → 7.4 → 7.5
```

Phases are sequential. Within each phase, tasks can be parallelized where they touch different files.
