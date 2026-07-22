import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session.server";
import { DiscordStrategy } from "./discordStrategy.server";
import { db } from "../db.server";
import { user as userTable } from "../../drizzle/schema";
import { permissionService } from "./permission.server";
import { saveDiscordTokens } from "./oauthToken.server";

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  isStaff: boolean;
}

export const authenticator = new Authenticator<User>();

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
    async ({ profile, tokens }) => {
      await db
        .insert(userTable)
        .values({
          id: profile.id,
          name: profile.global_name || profile.username,
          image: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : "https://cdn.discordapp.com/embed/avatars/0.png",
        })
        .onConflictDoUpdate({
          target: userTable.id,
          set: {
            name: profile.global_name || profile.username,
            image: profile.avatar
              ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
              : "https://cdn.discordapp.com/embed/avatars/0.png",
          },
        });

      const isStaff = await permissionService.checkIsStaff(profile.id).catch(() => false);
      await saveDiscordTokens(profile.id, tokens);

      return {
        id: profile.id,
        username: profile.global_name || profile.username,
        avatarUrl: profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : "https://cdn.discordapp.com/embed/avatars/0.png",
        isStaff,
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
