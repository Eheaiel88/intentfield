import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Operator maintenance, callable only through the Convex CLI/dashboard
// (internal functions are never exposed to clients).

// Adds an owner principal. Used once per environment after the owner's
// first sign-in, since principals embed the identity provider's issuer and
// therefore never carry across environments.
export const addOwner = internalMutation({
  args: { principal: v.string() },
  handler: async (ctx, { principal }) => {
    const existing = await ctx.db
      .query("owners")
      .withIndex("by_principal", (q) => q.eq("principal", principal))
      .unique();
    if (existing) return "already-owner";
    await ctx.db.insert("owners", { principal });
    return "added";
  },
});

// One-time preparation of a freshly imported production deployment: a dev
// snapshot carries published content (which is keyed by content key and
// wanted), but also dev-namespace member data (keyed by dev principals that
// can never authenticate in production) and dev purchase/webhook records.
// This deletes exactly that member-scoped data and nothing content-related.
// It refuses to run twice by requiring the explicit confirmation phrase.
export const clearMemberDataAfterImport = internalMutation({
  args: { confirmation: v.literal("CLEAR MEMBER DATA") },
  handler: async (ctx) => {
    const tables = [
      "notes",
      "lessons",
      "grants",
      "owners",
      "purchases",
      "webhookDeliveries",
      "checkoutNonces",
    ] as const;
    const deleted: Record<string, number> = {};
    for (const table of tables) {
      const rows = await ctx.db.query(table).collect();
      for (const row of rows) await ctx.db.delete(row._id);
      deleted[table] = rows.length;
    }
    return deleted;
  },
});
