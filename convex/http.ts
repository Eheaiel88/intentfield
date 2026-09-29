import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { verifyStandardWebhook } from "../src/lib/standard-webhooks";

// Whop webhook receiver, served from this deployment's .convex.site origin.
// The signature is verified over the raw body before anything is parsed or
// stored; WHOP_WEBHOOK_SECRET lives only in the Convex deployment's env.
// A verified delivery is applied in a single transaction, so returning 200
// means its effects are durable; any thrown error returns 500 and Whop
// retries with the same delivery id, which the mutation deduplicates.
const http = httpRouter();

http.route({
  path: "/whop/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.WHOP_WEBHOOK_SECRET;
    if (!secret)
      return new Response("Webhook secret is not configured.", {
        status: 503,
      });
    const payload = await request.text();
    const verified = await verifyStandardWebhook({
      id: request.headers.get("webhook-id"),
      timestamp: request.headers.get("webhook-timestamp"),
      signatureHeader: request.headers.get("webhook-signature"),
      payload,
      secret,
    });
    if (!verified) return new Response("Invalid signature.", { status: 401 });
    let envelope: { type?: unknown; data?: unknown };
    try {
      envelope = JSON.parse(payload);
    } catch {
      return new Response("Invalid JSON.", { status: 400 });
    }
    if (typeof envelope.type !== "string")
      return new Response("Missing event type.", { status: 400 });
    const result = await ctx.runMutation(internal.purchases.applyEvent, {
      deliveryId: request.headers.get("webhook-id")!,
      eventType: envelope.type,
      data: envelope.data ?? {},
    });
    return new Response(result, { status: 200 });
  }),
});

export default http;
