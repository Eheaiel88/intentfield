import { ConvexError } from "convex/values";
import { query, type QueryCtx, type MutationCtx } from "./_generated/server";
import type { Product } from "../src/lib/content";
type Ctx = QueryCtx | MutationCtx;
export async function identity(ctx: Ctx) {
  const user = await ctx.auth.getUserIdentity();
  if (!user) throw new ConvexError("Sign in to open your private workspace.");
  return user.tokenIdentifier;
}
export async function hasProduct(ctx: Ctx, principal: string, sku: Product) {
  const grants = await ctx.db
    .query("grants")
    .withIndex("by_principal_sku", (q) =>
      q.eq("principal", principal).eq("sku", sku),
    )
    .collect();
  return grants.some(
    (g) =>
      g.active && (g.validUntil === undefined || g.validUntil > Date.now()),
  );
}
export async function requireProduct(ctx: Ctx, sku: Product) {
  const principal = await identity(ctx);
  if (!(await hasProduct(ctx, principal, sku)))
    throw new ConvexError(
      `${sku === "course" ? "Prosperity 30" : sku === "book" ? "Book and workbook" : "Audio companion"} access is required.`,
    );
  return principal;
}
export const requireCourse = (ctx: Ctx) => requireProduct(ctx, "course");
export async function isOwner(ctx: Ctx, principal: string) {
  return !!(await ctx.db
    .query("owners")
    .withIndex("by_principal", (q) => q.eq("principal", principal))
    .unique());
}
export async function requireOwner(ctx: Ctx) {
  const principal = await identity(ctx);
  if (!(await isOwner(ctx, principal)))
    throw new ConvexError("Owner access is required.");
  return principal;
}
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const principal = await identity(ctx);
    const [book, course, audio, owner] = await Promise.all([
      hasProduct(ctx, principal, "book"),
      hasProduct(ctx, principal, "course"),
      hasProduct(ctx, principal, "audio"),
      isOwner(ctx, principal),
    ]);
    return { book, course, audio, owner };
  },
});
