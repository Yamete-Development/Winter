const IRIS_URL = (process.env.IRIS_URL || "http://localhost:8080").replace(/\/+$/, "");
const IRIS_TIMEOUT_MS = Number(process.env.IRIS_TIMEOUT_MS || 1500);

const IRIS_TLS = (() => {
  const caPath = process.env.IRIS_TLS_CA;
  const certPath = process.env.IRIS_TLS_CERT;
  const keyPath = process.env.IRIS_TLS_KEY;
  const configured = [caPath, certPath, keyPath].filter(Boolean).length;
  if (configured > 0 && configured < 3) {
    throw new Error("IRIS_TLS_CA, IRIS_TLS_CERT, and IRIS_TLS_KEY must be provided together.");
  }
  if (configured !== 3) return undefined;
  return {
    ca: Bun.file(caPath!),
    cert: Bun.file(certPath!),
    key: Bun.file(keyPath!),
    ...(process.env.IRIS_TLS_DOMAIN ? { serverName: process.env.IRIS_TLS_DOMAIN } : {}),
  };
})();

export class IrisUnavailableError extends Error {
  constructor(message = "Authorization service is unavailable.") { super(message); this.name = "IrisUnavailableError"; }
}

async function post<T>(path: string, payload: Record<string, string | number>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IRIS_TIMEOUT_MS);
  try {
    const response = await fetch(`${IRIS_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Connect-Protocol-Version": "1",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      ...(IRIS_TLS ? { tls: IRIS_TLS } : {}),
    });
    if (!response.ok) {
      const detail = (await response.text().catch(() => "")).trim().slice(0, 512);
      const suffix = detail ? ` ${detail}` : "";
      throw new IrisUnavailableError(`Authorization service returned ${response.status}.${suffix}`);
    }
    return await response.json() as T;
  } catch (error) {
    if (error instanceof IrisUnavailableError) throw error;
    throw new IrisUnavailableError();
  } finally { clearTimeout(timeout); }
}

export const irisClient = {
  async getEffectivePermissions(userId: string, hubId?: string): Promise<number> {
    const payload: Record<string, string> = { userId };
    if (hubId) payload.hubId = hubId;
    const data = await post<{ permissions?: number | string }>("/authz.v1.AuthZService/GetEffectivePermissions", payload);
    return Number.parseInt(String(data.permissions ?? 0), 10);
  },
  async getAuthorizedHubs(userId: string, requiredPermissions = 0): Promise<string[]> {
    const payload: Record<string, string | number> = { userId };
    if (requiredPermissions > 0) payload.requiredPermissions = String(requiredPermissions);
    const data = await post<{ hubIds?: string[] }>("/authz.v1.AuthZService/GetAuthorizedHubs", payload);
    return data.hubIds ?? [];
  },
  async invalidateUserPermissions(hubId: string, userId: string) {
    try { await post("/authz.v1.AuthZService/InvalidateUserPermissions", { hubId, userId }); }
    catch (error) { console.warn("[irisClient] permission invalidation deferred to TTL", error); }
  },
  async invalidateHubPermissions(hubId: string) {
    try { await post("/authz.v1.AuthZService/InvalidateHubPermissions", { hubId }); }
    catch (error) { console.warn("[irisClient] Hub invalidation deferred to TTL", error); }
  },
};
