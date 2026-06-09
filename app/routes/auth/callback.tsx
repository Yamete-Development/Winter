import { redirect } from "react-router";
import type { Route } from "./+types/callback";
import { authenticator } from "../../services/auth.server";
import { sessionStorage } from "../../services/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  // Strategy will either throw a redirect (Phase 1) or return the User (Phase 5)
  const user = await authenticator.authenticate("discord", request);
  
  // Create a session and commit the user data
  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  session.set("user", user);

  throw redirect("/dashboard", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
}
