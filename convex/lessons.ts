import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { answers } from "./schema";
import { requireCourse } from "./access";
import { completionError } from "../src/lib/lesson";
export const dayOne = query({
  args: {},
  handler: async (ctx) => {
    const principal = await requireCourse(ctx);
    const record = await ctx.db
      .query("lessons")
      .withIndex("by_principal_day", (q) =>
        q.eq("principal", principal).eq("day", 1),
      )
      .unique();
    return record
      ? {
          answers: record.answers,
          completed: record.completed,
          revision: record.revision,
          updatedAt: record.updatedAt,
        }
      : null;
  },
});
export const saveDayOne = mutation({
  args: { answers, completed: v.boolean(), expectedRevision: v.number() },
  handler: async (ctx, args) => {
    const principal = await requireCourse(ctx);
    if (Object.values(args.answers).some((v) => v.length > 6000))
      throw new ConvexError("Keep each answer under 6,000 characters.");
    const error = completionError(args.answers);
    if (args.completed && error) throw new ConvexError(error);
    const record = await ctx.db
      .query("lessons")
      .withIndex("by_principal_day", (q) =>
        q.eq("principal", principal).eq("day", 1),
      )
      .unique();
    if (args.expectedRevision !== (record?.revision ?? 0))
      throw new ConvexError(
        "This lesson was updated in another session. Keep a copy of your words, then reload before saving.",
      );
    const saved = {
      principal,
      day: 1,
      answers: args.answers,
      completed: args.completed,
      revision: (record?.revision ?? 0) + 1,
      updatedAt: Date.now(),
    };
    if (record) await ctx.db.patch(record._id, saved);
    else await ctx.db.insert("lessons", saved);
    return {
      answers: saved.answers,
      completed: saved.completed,
      revision: saved.revision,
      updatedAt: saved.updatedAt,
    };
  },
});
