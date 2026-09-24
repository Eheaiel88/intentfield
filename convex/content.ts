import { query, mutation, internalMutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { contentBody, sku } from "./schema";
import { identity, hasProduct, requireProduct, requireOwner } from "./access";
import type { ContentBody, Product } from "../src/lib/content";
function validate(key: string, product: Product, body: ContentBody) {
  const valid =
    product === "course"
      ? /^lesson\/([1-9]|[12]\d|30)$/.test(key) ||
        /^tool\/(desire|counter|habit|dream|focus|support|mastery|evidence)$/.test(
          key,
        ) ||
        key === "profile"
      : product === "audio"
        ? /^audio\/(morning|evening)$/.test(key)
        : key === "book";
  if (!valid) throw new ConvexError("Invalid content location.");
  if (
    !body.title.trim() ||
    body.title.length > 160 ||
    JSON.stringify(body).length > 100000
  )
    throw new ConvexError("A title and content under 100 KB are required.");
  if (
    body.fields.length > 20 ||
    new Set(body.fields.map((f) => f.id)).size !== body.fields.length
  )
    throw new ConvexError("Use unique worksheet field identifiers.");
}
export const library = query({
  args: {},
  handler: async (ctx) => {
    const principal = await identity(ctx);
    const products = await Promise.all(
      (["book", "course", "audio"] as const).map(async (sku) => ({
        sku,
        allowed: await hasProduct(ctx, principal, sku),
      })),
    );
    const allowed = new Set(
      products.filter((p) => p.allowed).map((p) => p.sku),
    );
    const all = await ctx.db.query("content").collect();
    return all
      .filter((c) => allowed.has(c.sku))
      .map(({ key, sku, body, revision, storageId, fileName }) => ({
        key,
        sku,
        body,
        revision,
        storageId,
        fileName,
      }));
  },
});
export const media = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const item = await ctx.db
      .query("content")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (!item) {
      await identity(ctx);
      return null;
    }
    await requireProduct(ctx, item.sku);
    return item.storageId
      ? {
          url: await ctx.storage.getUrl(item.storageId),
          fileName: item.fileName,
        }
      : null;
  },
});
export const ownerList = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    return await ctx.db.query("content").collect();
  },
});
export const saveDraft = mutation({
  args: { key: v.string(), body: contentBody, expectedRevision: v.number() },
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const item = await ctx.db
      .query("content")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!item) throw new ConvexError("Content not found.");
    validate(item.key, item.sku, args.body);
    if (item.revision !== args.expectedRevision)
      throw new ConvexError(
        "This content changed in another session. Reload before editing.",
      );
    await ctx.db.patch(item._id, {
      draft: args.body,
      revision: item.revision + 1,
      updatedAt: Date.now(),
    });
  },
});
export const publish = mutation({
  args: { key: v.string(), expectedRevision: v.number() },
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const item = await ctx.db
      .query("content")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!item?.draft || item.revision !== args.expectedRevision)
      throw new ConvexError(
        "Save your draft and reload the latest content before publishing.",
      );
    validate(item.key, item.sku, item.draft);
    await ctx.db.patch(item._id, {
      body: item.draft,
      draft: undefined,
      revision: item.revision + 1,
      updatedAt: Date.now(),
    });
  },
});
export const uploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
export const attachMedia = mutation({
  args: {
    key: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    expectedRevision: v.number(),
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const item = await ctx.db
      .query("content")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (
      !item ||
      !["book", "audio/morning", "audio/evening"].includes(item.key) ||
      item.revision !== args.expectedRevision
    )
      throw new ConvexError("Reload this media entry before uploading.");
    const meta = await ctx.db.system.get(args.storageId);
    if (
      !meta ||
      meta.size > 250 * 1024 * 1024 ||
      (item.key === "book"
        ? meta.contentType !== "application/pdf"
        : ![
            "audio/mpeg",
            "audio/mp4",
            "audio/wav",
            "audio/x-wav",
            "audio/ogg",
            "audio/aac",
            "audio/flac",
          ].includes(meta.contentType ?? ""))
    )
      throw new ConvexError(
        "Choose a PDF for the book or a supported audio file, up to 250 MB.",
      );
    await ctx.db.patch(item._id, {
      storageId: args.storageId,
      fileName: args.fileName.slice(0, 200),
      revision: item.revision + 1,
      updatedAt: Date.now(),
    });
    // Retain previous files for recovery; replacement does not destroy the original.
  },
});
export const seed = internalMutation({
  args: {
    items: v.array(v.object({ key: v.string(), sku, body: contentBody })),
  },
  handler: async (ctx, { items }) => {
    let added = 0;
    for (const item of items) {
      validate(item.key, item.sku, item.body);
      const old = await ctx.db
        .query("content")
        .withIndex("by_key", (q) => q.eq("key", item.key))
        .unique();
      if (!old) {
        await ctx.db.insert("content", {
          ...item,
          revision: 1,
          updatedAt: Date.now(),
        });
        added++;
      }
    }
    return { added };
  },
});
export const setOwner = internalMutation({
  args: { principal: v.string() },
  handler: async (ctx, { principal }) => {
    const old = await ctx.db
      .query("owners")
      .withIndex("by_principal", (q) => q.eq("principal", principal))
      .unique();
    if (!old) await ctx.db.insert("owners", { principal });
  },
});
export const removeMedia = mutation({
  args: { key: v.string(), expectedRevision: v.number() },
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const item = await ctx.db
      .query("content")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!item || item.revision !== args.expectedRevision)
      throw new ConvexError(
        "This media entry changed. Reload before removing the file.",
      );
    await ctx.db.patch(item._id, {
      storageId: undefined,
      fileName: undefined,
      revision: item.revision + 1,
      updatedAt: Date.now(),
    });
  },
});
