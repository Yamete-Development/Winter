import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session.server";
import { DiscordStrategy } from "./discordStrategy.server";

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  isStaff: boolean;
}

export const authenticator = new Authenticator<User>();

// Hardcoded staff IDs from the bot or team
const STAFF_IDS = ["123456789012345678"]; // Add real IDs later

if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET || !process.env.DISCORD_CALLBACK_URL) {
  console.warn("Discord OAuth credentials are not fully set in .env. Login will fail unless mocked.");
}

authenticator.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID || "MOCK_ID",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "MOCK_SECRET",
      callbackURL: process.env.DISCORD_CALLBACK_URL || "http://localhost:5173/auth/discord/callback",
      scope: ["identify", "guilds"],
    },
    async ({ profile }) => {
      return {
        id: profile.id,
        username: profile.global_name || profile.username,
        avatarUrl: profile.avatar 
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` 
          : "https://cdn.discordapp.com/embed/avatars/0.png",
        isStaff: STAFF_IDS.includes(profile.id),
      };
    }
  )
);

export async function requireUser(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  const user = session.get("user");
  if (!user) {
    throw new Response("Unauthorized", { status: 302, headers: { Location: "/" } });
  }
  return user as User;
}

export async function requireStaff(request: Request) {
  const user = await requireUser(request);
  if (!user.isStaff) {
    throw new Response("Unauthorized: Staff Only", { status: 403 });
  }
  return user;
}
