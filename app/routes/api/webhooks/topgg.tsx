import { type ActionFunctionArgs } from "react-router";
import { topGGService } from "~/services/topgg.server";

/**
 * Handles GET requests by returning a 405 Method Not Allowed.
 */
export async function loader() {
  return new Response("Method not allowed", { status: 405 });
}

/**
 * Handles POST webhook requests sent by Top.gg.
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const webhookSecret = process.env.TOPGG_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("TOPGG_WEBHOOK_SECRET environment variable is not set");
      return Response.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-topgg-signature");

    const isValid = topGGService.validateSignature(
      rawBody,
      signature,
      webhookSecret
    );

    if (!isValid) {
      console.error("Invalid Top.gg webhook cryptographic signature match");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error("Invalid Top.gg JSON payload:", error);
      return Response.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Validate structural fields
    if (
      !payload.type ||
      !payload.data?.project?.platform_id ||
      !payload.data?.user?.platform_id
    ) {
      return Response.json(
        { error: "Missing required structural fields" },
        { status: 400 }
      );
    }

    const result = await topGGService.processVote(payload);

    if (!result.success) {
      // Still try to announce if process fails, or handle test webhook
      await topGGService.sendDiscordVoteAnnouncement(payload, result);

      return Response.json(
        { error: result.error || "Failed to process vote" },
        {
          status:
            result.error === "Test votes not processed in production"
              ? 200
              : 500,
        }
      );
    }

    const sentNotif = await topGGService.sendDiscordVoteAnnouncement(
      payload,
      result
    );

    return Response.json(
      {
        success: true,
        sentNotif,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Top.gg webhook:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
