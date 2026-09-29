import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { applyGrant } from "./grants";
import { PURCHASE_ACCESS_DAYS, skuForPlan } from "../src/lib/whop-catalog";
import { whopSurfacePrincipal } from "../src/lib/whop-surface";

// Applies one verified Whop webhook delivery. The HTTP action has already
// checked the signature; nothing here trusts anything except that envelope.
// Everything happens in one transaction: the delivery record, the purchase
// row and the derived grant commit together or not at all. Unknown or
// not-yet-actionable events are recorded and ignored (returning success),
// so Whop does not retry forever; reconciliation reviews `ignored:` rows.
const ACCESS_MS = PURCHASE_ACCESS_DAYS * 24 * 60 * 60 * 1000;

// A checkout nonce is honored for one day after minting: long enough for a
// slow checkout or delayed webhook, short enough that a leaked stale value
// is worthless. The grant it routes still requires the signed webhook.
const NONCE_VALID_MS = 24 * 60 * 60 * 1000;
export const SITE_GRANT_SUFFIX = ":site";

type PurchaseStatus = "settled" | "refunded" | "disputed";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payload = any;

function parseTime(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

export const applyEvent = internalMutation({
  args: {
    deliveryId: v.string(),
    eventType: v.string(),
    data: v.any(),
  },
  handler: async (ctx, { deliveryId, eventType, data }) => {
    const seen = await ctx.db
      .query("webhookDeliveries")
      .withIndex("by_delivery", (q) => q.eq("deliveryId", deliveryId))
      .unique();
    if (seen) return "duplicate";
    const result = await handle(ctx, eventType, data);
    await ctx.db.insert("webhookDeliveries", {
      deliveryId,
      eventType,
      result,
      receivedAt: Date.now(),
    });
    return result;
  },
});

async function handle(
  ctx: Parameters<typeof applyGrant>[0],
  eventType: string,
  data: Payload,
): Promise<string> {
  if (eventType === "payment.succeeded") return applyPayment(ctx, data);
  if (eventType === "refund.created" || eventType === "refund.updated")
    return applyRefund(ctx, data);
  if (eventType === "dispute.created" || eventType === "dispute.updated")
    return applyDispute(ctx, data);
  return `ignored:unhandled-event`;
}

async function applyPayment(
  ctx: Parameters<typeof applyGrant>[0],
  payment: Payload,
): Promise<string> {
  const paymentId = payment?.id;
  const whopUserId = payment?.user?.id;
  const planId = payment?.plan?.id;
  if (typeof paymentId !== "string") return "ignored:no-payment-id";
  if (typeof whopUserId !== "string") return "ignored:no-user";
  if (typeof planId !== "string") return "ignored:no-plan";
  const sku = skuForPlan(planId);
  if (!sku) return `ignored:unknown-plan ${planId}`;
  if (payment?.status !== "paid") return `ignored:not-paid ${payment?.status}`;
  const paidAt = parseTime(payment?.paid_at) ?? Date.now();
  const existing = await ctx.db
    .query("purchases")
    .withIndex("by_payment", (q) => q.eq("paymentId", paymentId))
    .unique();
  // A late success delivery never reopens a refunded or disputed purchase.
  const status: PurchaseStatus =
    existing && existing.status !== "settled" ? existing.status : "settled";
  const rawNonce = payment?.metadata?.checkout_nonce;
  const nonce =
    typeof rawNonce === "string" ? rawNonce : existing?.checkoutNonce;
  const sitePrincipal =
    existing?.sitePrincipal ??
    (nonce ? await resolveNonce(ctx, nonce, paymentId, sku) : undefined);
  const row = {
    paymentId,
    whopUserId,
    planId,
    productId:
      typeof payment?.product?.id === "string" ? payment.product.id : undefined,
    sku,
    status,
    amount: typeof payment?.total === "number" ? payment.total : 0,
    currency: typeof payment?.currency === "string" ? payment.currency : "usd",
    paidAt,
    checkoutNonce: nonce,
    sitePrincipal,
    updatedAt: Date.now(),
  };
  if (existing) await ctx.db.replace(existing._id, row);
  else await ctx.db.insert("purchases", row);
  await applyGrant(ctx, {
    principal: whopSurfacePrincipal(whopUserId),
    sku,
    source: paymentId,
    active: status === "settled",
    validUntil: paidAt + ACCESS_MS,
  });
  if (sitePrincipal)
    await applyGrant(ctx, {
      principal: sitePrincipal,
      sku,
      source: paymentId + SITE_GRANT_SUFFIX,
      active: status === "settled",
      validUntil: paidAt + ACCESS_MS,
    });
  return existing ? "applied:payment-updated" : "applied:payment";
}

// A nonce routes a payment to the website member who minted it — only if it
// exists in our records, matches the purchased product, is fresh, and has
// not already been claimed by a different payment. Failing any of these,
// the purchase still stands for the Whop account; nothing is guessed.
async function resolveNonce(
  ctx: Parameters<typeof applyGrant>[0],
  nonce: string,
  paymentId: string,
  sku: string,
): Promise<string | undefined> {
  const record = await ctx.db
    .query("checkoutNonces")
    .withIndex("by_nonce", (q) => q.eq("nonce", nonce))
    .unique();
  if (!record) return undefined;
  if (record.sku !== sku) return undefined;
  if (record.usedByPaymentId && record.usedByPaymentId !== paymentId)
    return undefined;
  if (Date.now() - record.createdAt > NONCE_VALID_MS) return undefined;
  if (!record.usedByPaymentId)
    await ctx.db.patch(record._id, { usedByPaymentId: paymentId });
  return record.principal;
}

async function setPurchaseStatus(
  ctx: Parameters<typeof applyGrant>[0],
  paymentId: unknown,
  status: PurchaseStatus,
): Promise<string> {
  if (typeof paymentId !== "string") return "ignored:no-payment-id";
  const purchase = await ctx.db
    .query("purchases")
    .withIndex("by_payment", (q) => q.eq("paymentId", paymentId))
    .unique();
  // The payment may never have produced a purchase here (unknown plan, or
  // the success delivery has not arrived yet). Record it for reconciliation.
  if (!purchase) return `ignored:unknown-payment ${paymentId}`;
  await ctx.db.patch(purchase._id, { status, updatedAt: Date.now() });
  await applyGrant(ctx, {
    principal: whopSurfacePrincipal(purchase.whopUserId),
    sku: purchase.sku,
    source: purchase.paymentId,
    active: status === "settled",
    validUntil: purchase.paidAt + ACCESS_MS,
  });
  // A status change moves both surfaces' grants for this payment together.
  if (purchase.sitePrincipal)
    await applyGrant(ctx, {
      principal: purchase.sitePrincipal,
      sku: purchase.sku,
      source: purchase.paymentId + SITE_GRANT_SUFFIX,
      active: status === "settled",
      validUntil: purchase.paidAt + ACCESS_MS,
    });
  return `applied:${status}`;
}

async function applyRefund(
  ctx: Parameters<typeof applyGrant>[0],
  refund: Payload,
): Promise<string> {
  // Only a completed refund revokes; pending/failed/canceled refunds change
  // nothing. Revocation touches exactly the refunded payment's grant.
  if (refund?.status !== "succeeded")
    return `ignored:refund-${refund?.status}`;
  return setPurchaseStatus(ctx, refund?.payment?.id, "refunded");
}

async function applyDispute(
  ctx: Parameters<typeof applyGrant>[0],
  dispute: Payload,
): Promise<string> {
  // Access is suspended while a dispute is open and restored only on a won
  // outcome; every other terminal state stays revoked until support review.
  const status = dispute?.status;
  const next: PurchaseStatus = status === "won" ? "settled" : "disputed";
  return setPurchaseStatus(ctx, dispute?.payment?.id, next);
}
