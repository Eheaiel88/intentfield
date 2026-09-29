import { mutation } from "./_generated/server";
import { identity } from "./access";
import { sku } from "./schema";

// Mints the single-use checkout nonce the website carries through Whop
// payment metadata. It requires a signed-in member and can only ever route
// a purchase back to that same member, so it grants nothing by itself: the
// grant still requires Whop's signed payment webhook naming this nonce.
export const createNonce = mutation({
  args: { sku },
  handler: async (ctx, args) => {
    const principal = await identity(ctx);
    const nonce = crypto.randomUUID();
    await ctx.db.insert("checkoutNonces", {
      nonce,
      principal,
      sku: args.sku,
      createdAt: Date.now(),
    });
    return nonce;
  },
});
