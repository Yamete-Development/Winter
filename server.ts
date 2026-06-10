import { createRequestHandler } from "react-router";

// @ts-expect-error - This file is generated dynamically by Vite during the build process
const build = (await import('./build/server/index.js')) as ServerBuild;

const handleRequest = createRequestHandler(build, process.env.NODE_ENV || "production");

Bun.serve({
  port: process.env.PORT || 4000,
  async fetch(req) {
    const url = new URL(req.url);

    // 1. Serve static client assets built by Vite
    // We check if the file exists in the build/client folder.
    // (We exclude the root "/" so it properly hits React Router)
    if (url.pathname !== "/") {
      const file = Bun.file(`./build/client${url.pathname}`);
      if (await file.exists()) {
        // You can add caching headers here for production if you'd like
        return new Response(file);
      }
    }

    // 2. Pass all other requests to React Router
    // Your app/routes/api.tsx (or wherever oRPC is) will handle the API calls seamlessly.
    return handleRequest(req);
  },
});

console.log(`🥟 Bun server running on http://localhost:${process.env.PORT || 4000}`);