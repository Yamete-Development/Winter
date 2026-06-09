import type { Route } from "./+types/discord";
import { authenticator } from "../../services/auth.server";

export async function action({ request }: Route.ActionArgs) {
  return await authenticator.authenticate("discord", request);
}

export async function loader({ request }: Route.LoaderArgs) {
  return await authenticator.authenticate("discord", request);
}
