import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { applyGrant } from "./grants";
import {
  PURCHASE_ACCESS_DAYS,
  skuForPlan,
  whopCatalog,
} from "../src/lib/whop-catalog";
import { whopSurfacePrincipal } from "../src/lib/whop-surface";

// Applies one verified Whop webhook delivery. The HTTP action has already
// checked the signature; nothing here trusts anything except that envelope.
// Everything happens in one transaction: the delivery record, the purchase
// row and the derived grant commit together or not at all. Unknown or
// not-yet-actionable events are recorded and ignored (returning success),
// so Whop does not retry forever; reconciliation reviews `ignored:` rows.
const ACCESS_MS = PURCHASE_ACCESS_DAYS * 24 * 60 * 60 * 1000;

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
  const nonce = payment?.metadata?.checkout_nonce;
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
    checkoutNonce: typeof nonce === "string" ? nonce : existing?.checkoutNonce,
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
  return existing ? "applied:payment-updated" : "applied:payment";
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

// Deliberately unused until Phase 4: website checkouts carry a
// server-issued nonce in payment metadata; resolving it to a Clerk member
// adds a second grant with source `${paymentId}:site`. Recorded here so the
// grant-source convention is fixed in one place.
export const SITE_GRANT_SUFFIX = ":site";
export const catalogAccountId = whopCatalog.accountId;
