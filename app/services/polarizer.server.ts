import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { readFileSync } from "node:fs";
import { TRUST_SAFETY_DESCRIPTOR_BASE64 } from "~/generated/trustSafetyDescriptor";

type UnaryClient = Record<string, (request: unknown, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (error: grpc.ServiceError | null, response?: any) => void) => void>;
let client: UnaryClient | undefined;

function credentials() {
  const caPath = process.env.POLARIZER_TLS_CA;
  const certPath = process.env.POLARIZER_TLS_CERT;
  const keyPath = process.env.POLARIZER_TLS_KEY;
  if (caPath && certPath && keyPath) return grpc.credentials.createSsl(readFileSync(caPath), readFileSync(keyPath), readFileSync(certPath));
  if (process.env.POLARIZER_ALLOW_INSECURE === "true" && process.env.NODE_ENV !== "production") return grpc.credentials.createInsecure();
  throw new Error("Polarizer mTLS credentials are not configured.");
}

function getClient() {
  if (client) return client;
  const definition = protoLoader.loadFileDescriptorSetFromBuffer(Buffer.from(TRUST_SAFETY_DESCRIPTOR_BASE64, "base64"), {
    keepCase: false, longs: String, enums: String, defaults: true, oneofs: true,
  });
  const loaded = grpc.loadPackageDefinition(definition) as any;
  const Service = loaded.interchat.trust_and_safety.v2.TrustAndSafetyService;
  const address = process.env.POLARIZER_GRPC_ADDRESS || "localhost:50051";
  client = new Service(address, credentials(), {
    "grpc.ssl_target_name_override": process.env.POLARIZER_TLS_DOMAIN,
    "grpc.default_authority": process.env.POLARIZER_TLS_DOMAIN,
  }) as UnaryClient;
  return client;
}

function call<T>(method: string, request: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const deadline = new Date(Date.now() + Number(process.env.POLARIZER_TIMEOUT_MS || 2500));
    const rpc = getClient()[method];
    if (!rpc) return reject(new Error(`Polarizer method ${method} is unavailable.`));
    rpc.call(getClient(), request, new grpc.Metadata(), { deadline }, (error, response) => error ? reject(error) : resolve(response as T));
  });
}

function requestContext(actorId: string, mutation = false) {
  return {
    requestId: crypto.randomUUID(), actorId, actorType: "ACTOR_TYPE_HUMAN",
    servicePrincipal: process.env.POLARIZER_SERVICE_PRINCIPAL || "interchat-winter",
    idempotencyKey: mutation ? crypto.randomUUID() : "", traceId: "",
  };
}

const hubScope = (hubId: string) => ({ type: "SCOPE_TYPE_HUB", id: hubId, product: "PRODUCT_HUB" });
const page = (cursor?: string) => ({ pageSize: 40, cursor: cursor || "" });

export const polarizerClient = {
  listReviews: (actorId: string, hubId: string, cursor?: string) => call<any>("listReviewItems", { context: requestContext(actorId), scope: hubScope(hubId), status: "RESOURCE_STATUS_PENDING", page: page(cursor) }),
  listReports: (actorId: string, hubId: string, cursor?: string) => call<any>("listReports", { context: requestContext(actorId), scope: hubScope(hubId), status: "RESOURCE_STATUS_PENDING", page: page(cursor) }),
  listAppeals: (actorId: string, hubId: string, cursor?: string) => call<any>("listAppeals", { context: requestContext(actorId), scope: hubScope(hubId), status: "RESOURCE_STATUS_PENDING", page: page(cursor) }),
  listInfractions: (actorId: string, hubId: string, cursor?: string) => call<any>("listInfractions", { context: requestContext(actorId), scope: hubScope(hubId), status: "RESOURCE_STATUS_UNSPECIFIED", page: page(cursor) }),
  listRestrictions: (actorId: string, hubId: string, cursor?: string) => call<any>("listRestrictions", { context: requestContext(actorId), scope: hubScope(hubId), status: "RESOURCE_STATUS_UNSPECIFIED", page: page(cursor) }),
  adjudicateHeld: (actorId: string, input: { reviewItemId: string; resolution: "APPROVE" | "REJECT" | "EXPIRE"; reason: string; expectedVersion: number }) => call<any>("adjudicateHeldAction", { context: requestContext(actorId, true), reviewItemId: input.reviewItemId, resolution: `HELD_ACTION_RESOLUTION_${input.resolution}`, reason: input.reason, expectedVersion: String(input.expectedVersion) }),
};
