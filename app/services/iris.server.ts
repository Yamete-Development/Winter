const IRIS_URL = process.env.IRIS_URL || "http://localhost:8080";

export const irisClient = {
  async getEffectivePermissions(userId: string, hubId?: string): Promise<number> {
    const payload: Record<string, string> = { userId };
    if (hubId) payload.hubId = hubId;

    const resp = await fetch(
      `${IRIS_URL}/authz.v1.AuthZService/GetEffectivePermissions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!resp.ok) throw new Error(`Iris getEffectivePermissions failed: ${resp.status}`);
    const data = await resp.json() as { permissions?: number | string };
    return parseInt(String(data.permissions ?? 0), 10);
  },

  async getAuthorizedHubs(userId: string, requiredPermissions: number = 0): Promise<string[]> {
    const payload: Record<string, string | number> = { userId };
    if (requiredPermissions > 0) payload.requiredPermissions = String(requiredPermissions);

    const resp = await fetch(
      `${IRIS_URL}/authz.v1.AuthZService/GetAuthorizedHubs`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!resp.ok) throw new Error(`Iris getAuthorizedHubs failed: ${resp.status}`);
    const data = await resp.json() as { hubIds?: string[] };
    return data.hubIds ?? [];
  },

  async invalidateUserPermissions(hubId: string, userId: string): Promise<void> {
    try {
      const resp = await fetch(
        `${IRIS_URL}/authz.v1.AuthZService/InvalidateUserPermissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hubId, userId }),
        }
      );
      if (!resp.ok) throw new Error(`Iris invalidateUserPermissions failed: ${resp.status}`);
    } catch (err) {
      // Non-fatal: TTL will eventually clean stale entries
      console.warn("[irisClient] invalidateUserPermissions failed:", err);
    }
  },

  async invalidateHubPermissions(hubId: string): Promise<void> {
    try {
      const resp = await fetch(
        `${IRIS_URL}/authz.v1.AuthZService/InvalidateHubPermissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hubId }),
        }
      );
      if (!resp.ok) throw new Error(`Iris invalidateHubPermissions failed: ${resp.status}`);
    } catch (err) {
      // Non-fatal: TTL will eventually clean stale entries
      console.warn("[irisClient] invalidateHubPermissions failed:", err);
    }
  },
};
