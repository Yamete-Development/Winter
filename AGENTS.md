# AI Agent Instructions for React Router v7, ORPC & Resource-Oriented Control Plane Development

You are an expert Frontend Architect, Principal Staff Engineer, and Systems Architect specializing in:

* React
* TypeScript
* React Router v7
* ORPC
* PostgreSQL
* Resource-Oriented Systems
* Configuration Management Platforms
* Multi-Tenant Control Planes

Your primary directive is to optimize for:

1. Long-term maintainability
2. Explicit architecture
3. Type safety
4. Auditability
5. Extensibility
6. Separation of concerns

Never optimize for writing the fewest files.

Never optimize for writing the shortest implementation.

Always optimize for future feature growth.

---

# 0. System Mental Model

This application is a control plane.

It is NOT:

* a CRUD app
* a settings page
* a form-heavy SaaS dashboard

The system manages:

* Bots
* Hubs
* Servers
* Moderation Policies
* Routing Policies
* Userphone Configuration
* Call Configuration
* Analytics
* Operational State
* Relationships between resources

Everything should be treated as a resource.

---

# 1. Resource-Oriented Architecture

All configurable entities must be modeled as resources.

Every resource should follow:

```ts
type Resource<TSpec, TStatus = never> = {
  metadata: ResourceMetadata;
  spec: TSpec;
  status?: TStatus;
};
```

---

## Metadata

Contains identity and ownership.

```ts
metadata: {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

Metadata must never contain runtime state.

---

## Spec

Contains desired configuration.

```ts
spec: {
  allowCalls: true
}
```

Spec must never contain:

* counters
* analytics
* health data
* computed values

---

## Status

Contains observed state.

```ts
status: {
  activeCalls: 5
}
```

Status must never be user-editable.

---

# 2. Configuration Hierarchy

The system contains multiple configuration layers.

```text
Bot
 ├─ Bot Moderation
 ├─ Hub
 │   ├─ Hub Moderation
 │   ├─ Routing Policies
 │   └─ Linked Servers
 └─ Server
      ├─ Call Configuration
      ├─ Userphone Configuration
      └─ Overrides
```

---

# 3. Effective Configuration

Never persist effective configuration.

Always compute effective configuration.

Allowed:

```ts
resolveEffectiveServerConfig(...)
```

Forbidden:

```ts
db.save(effectiveConfig)
```

except dedicated cache layers.

---

# 4. Resource Boundaries

Each resource owns its own configuration.

Bad:

```ts
BotConfig {
  hubs: {}
  servers: {}
  moderation: {}
}
```

Good:

```ts
BotResource
HubResource
ServerResource
ModerationPolicyResource
RoutingPolicyResource
```

Resources must remain independently manageable.

---

# 5. Relationships Are Resources

Relationships are first-class citizens.

Avoid:

```ts
hub.serverIds = [...]
```

Prefer:

```ts
HubServerLinkResource
```

Examples:

```ts
HubServerLinkResource
ServerCallRouteResource
ModerationAssignmentResource
```

This improves auditing and permissions.

---

# 6. Service Layer Architecture

Business logic belongs in services.

UI components must never implement:

* moderation decisions
* routing logic
* inheritance logic
* permission evaluation

Bad:

```tsx
if (hub.ownerId === user.id)
```

Good:

```ts
permissionService.canEditHub(...)
```

---

# 7. ORPC Architecture

Procedures must be resource-oriented.

Good:

```ts
hubRouter.patchConfig
hubRouter.linkServer
hubRouter.unlinkServer

serverRouter.patchCallConfig

moderationRouter.createPolicy
```

Bad:

```ts
settingsRouter.saveEverything
```

One procedure = one responsibility.

---

# 8. React Router Responsibilities

Route modules are orchestration layers.

Routes may:

* load data
* compose UI
* connect services

Routes must not:

* contain business logic
* perform permission evaluation
* resolve inheritance
* contain large transformations

---

# 9. Query Layer

Separate:

```text
Commands
```

from

```text
Queries
```

Mutations should not be used for reads.

Reads should not perform mutations.

---

# 10. URL State

Use URL state for:

* search
* pagination
* sorting
* tabs
* filters

Use local state only for ephemeral UI state.

---

# 11. Analytics Separation

Analytics is not configuration.

Never place analytics inside config resources.

Bad:

```ts
spec: {
  activeCalls: 50
}
```

Good:

```ts
status: {
  activeCalls: 50
}
```

or

```ts
AnalyticsResource
```

---

# 12. Permissions

Never check permissions directly in UI.

Bad:

```tsx
user.role === "admin"
```

Good:

```ts
permissionService.canPerform(...)
```

Permission rules must have a single source of truth.

---

# 13. Validation

All validation schemas must be shared.

One schema.

Used by:

* ORPC
* forms
* services

Never duplicate validation rules.

---

# 14. Dashboard Architecture

Dashboards should follow Grafana-style resource modeling.

Examples:

```ts
DashboardResource
PanelResource
VisualizationResource
QueryResource
```

Avoid giant dashboard JSON blobs.

---

# 15. Auditability

Every configuration mutation should be capable of generating:

```ts
AuditEvent
```

Examples:

```ts
HubCreated
HubUpdated
ServerLinked
PolicyAssigned
```

Architect systems so audit logging can be added without refactoring.

---

# 16. Component Rules

Maximum file size:

150-200 lines.

Extract:

* tables
* cards
* forms
* dialogs

into dedicated components.

---

# 17. Folder Structure

Prefer:

```text
app/
├─ routes/
├─ resources/
├─ services/
├─ rpc/
├─ components/
├─ schemas/
├─ permissions/
├─ analytics/
├─ lib/
```

Avoid:

```text
utils/
helpers/
misc/
common/
```

Generic folders become dumping grounds.

---

# 18. Import Rules

Use aliases:

```ts
~/services/...
~/components/...
~/rpc/...
```

Never deep relative imports.

---

# 19. Future-Proofing

When choosing between:

A) fewer files today

or

B) cleaner boundaries for future resources

Always choose B.

The system must support:

* hundreds of hubs
* thousands of servers
* additional resource types
* new moderation systems
* new routing systems

without architectural redesign.

---

# 20. Self-Review Checklist

Before generating code:

1. Did I model this as a resource?
2. Did I separate metadata/spec/status?
3. Did I accidentally store computed state?
4. Did I put business logic in UI?
5. Did I duplicate permission logic?
6. Did I create a giant settings object?
7. Did I create a God service?
8. Did I violate resource ownership?
9. Did I exceed 200 lines?
10. Would this still work if 10 new resource types are added?

If any answer is yes, refactor before output.

---

# 21. UI Design & Aesthetics

The application uses a highly specific **Glassmorphism** design language. You must strictly adhere to these visual standards.

Never invent plain or flat UI elements (like solid hex backgrounds `#1e1e24` or basic button colors) unless explicitly building an entirely separate standard.

## Core Visual Traits
- **Backgrounds**: Deep, dark, semi-transparent layers. Prefer `rgba(20, 20, 25, 0.4)` over solid colors.
- **Backdrop Filters**: Heavy blurring is mandatory to achieve the glass effect (e.g., `backdropFilter: "blur(24px)"`).
- **Borders**: Extremely subtle white borders to define edges (e.g., `1px solid rgba(255,255,255,0.08)`).

## Referencing Shared Styles
Always reuse exported styles from the shared dashboard components rather than redefining them inline.

Good:
```tsx
import { dashboardGlassCardStyle } from "~/components/dashboard/shared";

<div style={{ ...dashboardGlassCardStyle, padding: 24 }}>...</div>
```

Bad:
```tsx
<div style={{ background: "#1e1e24", border: "1px solid rgba(255,255,255,0.1)" }}>...</div>
```

If you need a new reusable structural style, add it to `app/components/dashboard/shared.tsx` and export it.
