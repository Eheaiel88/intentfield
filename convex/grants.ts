import { internalMutation, type MutationCtx } from "./_generated/server";
import { v, ConvexError, type Infer } from "convex/values";
import { sku } from "./schema";
const grantArgs = {
  principal: v.string(),
  sku,
  source: v.string(),
  active: v.boolean(),
  validUntil: v.optional(v.number()),
};
export async function applyGrant(
  ctx: MutationCtx,
  args: {
    principal: string;
    sku: Infer<typeof sku>;
    source: string;
    active: boolean;
    validUntil?: number;
  },
) {
  const existing = await ctx.db
    .query("grants")
    .withIndex("by_source", (q) => q.eq("source", args.source))
    .unique();
  if (
    existing &&
    (existing.principal !== args.principal || existing.sku !== args.sku)
  )
    throw new ConvexError("A purchase source cannot be reassigned.");
  if (existing) await ctx.db.replace(existing._id, args);
  else await ctx.db.insert("grants", args);
}
// Only a trusted purchase integration may call this internal mutation. No
// browser API grants access, and checkout return URLs never establish payment.
export const applyVerified = internalMutation({
  args: grantArgs,
  handler: applyGrant,
});
