import { type ActionFunctionArgs } from "react-router";
import { requireUser } from "~/services/auth.server";
import jwt from "jsonwebtoken";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const user = await requireUser(request);
  const secret = process.env.BEACON_JWT_SECRET;

  if (!secret) {
    console.error("BEACON_JWT_SECRET is not configured");
    return new Response("Server configuration error", { status: 500 });
  }

  // Generate a short-lived JWT token valid for 5 minutes
  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
    },
    secret,
    { expiresIn: "5m" }
  );

  return Response.json({ token });
}
