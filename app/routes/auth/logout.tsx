import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { sessionStorage } from "../../services/session.server";

export async function action({ request }: Route.ActionArgs) {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  return redirect("/", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
}
