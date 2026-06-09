import { Strategy } from "remix-auth/strategy";
import { createCookie, redirect } from "react-router";

// We use an encrypted cookie to store the OAuth `state` to prevent CSRF attacks.
export const oauthStateCookie = createCookie("oauth_state", {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 10, // 10 minutes to finish login
  secrets: [process.env.SESSION_SECRET || "default_dev_secret_interchat_2026"],
});

export interface DiscordStrategyOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  scope?: string[];
}

export class DiscordStrategy<User> extends Strategy<User, { profile: any }> {
  name = "discord";

  constructor(
    protected options: DiscordStrategyOptions,
    verify: Strategy.VerifyFunction<User, { profile: any }>
  ) {
    super(verify);
  }

  async authenticate(request: Request): Promise<User> {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    // Phase 1: Redirect to Discord
    if (!code) {
      const stateString = Math.random().toString(36).substring(2);
      const scopes = this.options.scope?.join(" ") || "identify";
      
      const authUrl = new URL("https://discord.com/api/oauth2/authorize");
      authUrl.searchParams.set("client_id", this.options.clientID);
      authUrl.searchParams.set("redirect_uri", this.options.callbackURL);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", scopes);
      authUrl.searchParams.set("state", stateString);

      throw redirect(authUrl.toString(), {
        headers: {
          "Set-Cookie": await oauthStateCookie.serialize(stateString),
        },
      });
    }

    // Phase 2: Callback validation
    const cookieHeader = request.headers.get("Cookie");
    const savedState = await oauthStateCookie.parse(cookieHeader);
    
    if (!state || state !== savedState) {
      throw new Error("Invalid state parameter. CSRF protection triggered.");
    }

    // Phase 3: Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: this.options.clientID,
      client_secret: this.options.clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: this.options.callbackURL,
    });

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams,
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error("Token Exchange Error:", err);
      throw new Error("Failed to fetch access token from Discord");
    }

    const { access_token } = await tokenResponse.json();

    // Phase 4: Fetch user profile
    const profileResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!profileResponse.ok) {
      throw new Error("Failed to fetch user profile from Discord");
    }

    const profile = await profileResponse.json();

    // Phase 5: Pass the raw profile up to the application's verify function
    return await this.verify({ profile });
  }
}
