import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import type { RouterClient } from "@orpc/server";
import type { AppRouter } from "../rpc/router";

export const orpcClient = createORPCClient<RouterClient<AppRouter>>(
  new RPCLink({
    url: typeof window !== "undefined" ? `${window.location.origin}/api/v1` : "http://localhost:5173/api/v1",
    headers: () => ({}),
    fetch: (url, init) => fetch(url, { ...init, credentials: "include" }),
  })
);

export const orpc = createORPCReactQueryUtils(orpcClient);
