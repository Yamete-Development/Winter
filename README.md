# InterChat Dashboard (Web)

The web dashboard and control plane for **InterChat**. Built with React Router v7, Bun, React Query, Drizzle ORM, and oRPC. It manages cross-server connections, hub moderation settings, live chat analytics, and user access.

## Architecture

The project is structured around a **Resource-Oriented Architecture** for maximum extensibility.

* **Frontend:** React 19, React Router v7, Ant Design, Tailwind CSS
* **Backend:** oRPC, Drizzle ORM (PostgreSQL), Bun
* **State Management:** React Query, React Virtuoso (for massive virtualized logs)
* **Real-time Engine:** Prism (Elixir SSE Server)

### Key Directories
- `app/components/`: Modular React UI components (Dashboard tabs, Modals, Wizards).
- `app/resources/`: Strongly-typed Resource definitions (Hubs, Connections, Messages). Separates data into `metadata`, `spec` (desired configuration), and `status` (observed state).
- `app/services/`: Core backend logic (Drizzle Database access, Permissions, Business rules).
- `app/rpc/`: oRPC routers bridging the client `useQuery` calls directly to the server logic.
- `drizzle/`: PostgreSQL schemas and relationships.

---

## Prerequisites

- [Bun](https://bun.sh/) (v1.x)
- PostgreSQL (v15+)
- Redis (For active session state/caching)
- **Prism** (Our Elixir-based Server-Sent Events fanout server)

## Environment Variables

Copy the `.env.example` file to `.env` and fill in the required variables:

```bash
cp .env.example .env
```

**Required `.env` Variables:**
```env
SESSION_SECRET="your_secure_random_string_here"
JWT_SECRET="super_secret_jwt_key_12345"

# Discord OAuth configuration
DISCORD_CLIENT_ID="your_discord_client_id"
DISCORD_CLIENT_SECRET="your_discord_client_secret"
DISCORD_CALLBACK_URL="http://localhost:5173/auth/discord/callback"

# Database connection
DATABASE_URL="postgresql://user:password@localhost:5432/interchat"

# Unsplash (For dynamic background generation)
VITE_UNSPLASH_ACCESS_KEY="unsplash_api_key"
VITE_UNSPLASH_DASHBOARD_COLLECTION_ID="1252124"
```

## Setup & Installation

1. **Install dependencies:**
   We strictly use `bun` as our package manager and runner. Do not use `npm` or `pnpm`.
   ```bash
   bun install
   ```

2. **Database Migrations (Drizzle):**
   Ensure your local PostgreSQL instance is running, then sync the database schema:
   ```bash
   bun run drizzle-kit push
   ```

## Local Development Workflow

To fully develop and test the live dashboard, you need to run both the Web Server and the Beacon SSE Server concurrently.

1. **Start the Web Dashboard:**
   ```bash
   bun run dev
   ```
   The site will be running at `http://localhost:5173`.

2. **Start Prism (SSE Server):**
   Prism is the Elixir Broadway/Prism worker responsible for piping live Discord messages into the web UI. In a separate terminal, navigate to the `interchat-broadcast-worker` directory and start it:
   ```bash
   cd ../interchat-broadcast-worker
   mix deps.get
   mix phx.server
   ```

3. **Typechecking:**
   To ensure strict TS safety, run:
   ```bash
   bun run typecheck
   ```

## Production Deployment

1. **Build the assets and server:**
   ```bash
   bun run build
   ```

2. **Run the production server:**
   ```bash
   bun run start
   ```
   The Bun production server listens on `http://localhost:4000` by default (configurable via `PORT`).
