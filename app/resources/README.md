# Resource-Oriented Control Plane Architecture

This repository follows a strict Resource-Oriented Architecture (ROA) as defined in `AGENTS.md`. All configuration, state, and relationships must be modeled as discrete resources rather than monolithic data blobs.

## Core Concepts

Every resource in the system follows a standard shape:

```typescript
type Resource<TSpec, TStatus = never> = {
  metadata: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  spec: TSpec;      // User-editable, desired state
  status?: TStatus; // Read-only, observed state
};
```

### 1. Metadata
Metadata contains identity and ownership. It never contains runtime state, configuration, or business logic. 

### 2. Spec
Spec contains the desired configuration that users can edit (e.g., `allowCalls: true`). It should *never* contain metrics, counters, health data, or computed values.

### 3. Status
Status contains observed state (e.g., `activeCalls: 5`). It is always computed or updated by the system and is *never* user-editable.

## Current Resources

### Hub Resource (`app/resources/hub.ts`)
The `HubResource` represents a central connection point for multiple servers in InterChat.

- **Metadata**: Hub ID, owner ID, creation timestamps.
- **Spec**: Visibility, region, language, description, limits, and styling (iconUrl, bannerUrl).
- **Status**: Verification status, partner status, weekly message counts.

## Implementation Guidelines

1. **No God Objects**: Never place all settings inside a giant `BotConfig` or `DashboardSettings` object. Break them down into `BotResource`, `HubResource`, `ServerResource`, `ModerationPolicyResource`, etc.
2. **Relationships as Resources**: Avoid arrays of IDs (e.g., `hub.serverIds`). Use relationship resources (e.g., `HubServerLinkResource`).
3. **No Effective Config Persistence**: Do not store computed/effective configuration in the database. Compute it on the fly or use a cache layer.
4. **Service Layer Isolation**: Business logic, permissions, and validation belong in the `app/services/` layer, not in React Router loaders/actions or UI components.
5. **ORPC Integration**: Use ORPC (`app/rpc/`) for fetching and mutating resources to maintain type safety across the network boundary.

When adding new features, always ask: *How can I model this as a discrete resource?*
