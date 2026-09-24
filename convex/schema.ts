import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export const sku = v.union(
  v.literal("book"),
  v.literal("course"),
  v.literal("audio"),
);
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
});
