import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export const sku = v.union(
  v.literal("book"),
  v.literal("course"),
  v.literal("audio"),
);
export const audioVoice = v.union(v.literal("male"), v.literal("female"));
const audioVariant = v.object({
  voice: audioVoice,
  storageId: v.id("_storage"),
  fileName: v.string(),
});
export const answers = v.object({
  stability: v.string(),
  experiences: v.string(),
  qualities: v.string(),
  focus: v.string(),
  meaning: v.string(),
  scene: v.string(),
  action: v.string(),
  review: v.string(),
  appreciation: v.string(),
});
export const contentBody = v.object({
  title: v.string(),
  summary: v.string(),
  paragraphs: v.array(v.string()),
  steps: v.array(v.string()),
  action: v.string(),
  reflection: v.string(),
  am: v.string(),
  pm: v.string(),
  sources: v.array(v.string()),
  fields: v.array(
    v.object({ id: v.string(), label: v.string(), placeholder: v.string() }),
  ),
});
export default defineSchema({
  owners: defineTable({ principal: v.string() }).index("by_principal", [
    "principal",
  ]),
  notes: defineTable({
    principal: v.string(),
    key: v.string(),
    values: v.record(v.string(), v.string()),
    completed: v.boolean(),
    revision: v.number(),
    updatedAt: v.number(),
  }).index("by_principal_key", ["principal", "key"]),
  content: defineTable({
    key: v.string(),
    sku,
    body: contentBody,
    draft: v.optional(contentBody),
    revision: v.number(),
    storageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    audioVariants: v.optional(v.array(audioVariant)),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
  grants: defineTable({
    principal: v.string(),
    sku,
    source: v.string(),
    active: v.boolean(),
    validUntil: v.optional(v.number()),
  })
    .index("by_principal_sku", ["principal", "sku"])
    .index("by_source", ["source"]),
  lessons: defineTable({
    principal: v.string(),
    day: v.number(),
    answers: v.record(v.string(), v.string()),
    completed: v.boolean(),
    revision: v.number(),
    updatedAt: v.number(),
  }).index("by_principal_day", ["principal", "day"]),
  // One row per verified Whop payment: the source of truth for access.
  // Grants derive from these rows, so members keep access when Whop is
  // unreachable. Status only moves forward out of settled; a late
  // payment.succeeded never resurrects a refunded or disputed purchase.
  purchases: defineTable({
    paymentId: v.string(),
    whopUserId: v.string(),
    planId: v.string(),
    productId: v.optional(v.string()),
    sku,
    status: v.union(
      v.literal("settled"),
      v.literal("refunded"),
      v.literal("disputed"),
    ),
    amount: v.number(),
    currency: v.string(),
    paidAt: v.number(),
    checkoutNonce: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_payment", ["paymentId"])
    .index("by_whop_user", ["whopUserId"]),
  // Every webhook delivery id is recorded before its effects are applied,
  // in the same transaction; a redelivered event changes nothing twice.
  webhookDeliveries: defineTable({
    deliveryId: v.string(),
    eventType: v.string(),
    result: v.string(),
    receivedAt: v.number(),
  }).index("by_delivery", ["deliveryId"]),
});
