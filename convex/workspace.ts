import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { identity, hasProduct, requireProduct } from "./access";
import { toolIds, profileDomains, type Product } from "../src/lib/content";
import { completionError, type Answers } from "../src/lib/lesson";
function productFor(key: string): Product | null {
  if (key === "workbook") return "book";
  if (key === "settings") return null;
  if (
    key === "profile" ||
    key === "draft/daily" ||
    key === "draft/weekly" ||
    /^ledger\/[a-zA-Z0-9-]{1,80}$/.test(key) ||
    /^guide\/([1-9]|[12]\d|30)\/[a-zA-Z0-9-]{1,80}$/.test(key) ||
    toolIds.some((id) => key === `tool/${id}`)
  )
    return "course";
  throw new ConvexError("Unknown worksheet.");
}
function validate(values: Record<string, string>) {
  if (
    Object.keys(values).length > 40 ||
    Object.entries(values).some(([k, v]) => k.length > 80 || v.length > 6000)
  )
    throw new ConvexError("Keep each answer under 6,000 characters.");
}
export const snapshot = query({
  args: {},
  handler: async (ctx) => {
    const principal = await identity(ctx);
    const [book, course] = await Promise.all([
      hasProduct(ctx, principal, "book"),
      hasProduct(ctx, principal, "course"),
    ]);
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_principal_key", (q) => q.eq("principal", principal))
      .collect();
    const lessons = course
      ? await ctx.db
          .query("lessons")
          .withIndex("by_principal_day", (q) => q.eq("principal", principal))
          .collect()
      : [];
    return {
      notes: notes
        .filter((n) => {
          const p = productFor(n.key);
          return !p || (p === "book" ? book : course);
        })
        .map(({ key, values, revision, completed, updatedAt }) => ({
          key,
          values,
          revision,
          completed,
          updatedAt,
        })),
      lessons: lessons.map(
        ({ day, answers, revision, completed, updatedAt }) => ({
          day,
          answers,
          revision,
          completed,
          updatedAt,
        }),
      ),
    };
  },
});
export const saveNote = mutation({
  args: {
    key: v.string(),
    values: v.record(v.string(), v.string()),
    expectedRevision: v.number(),
  },
  handler: async (ctx, args) => {
    const sku = productFor(args.key);
    const principal = sku
      ? await requireProduct(ctx, sku)
      : await identity(ctx);
    validate(args.values);
    if (
      args.key === "settings" &&
      (Object.keys(args.values).some((k) => k !== "name") ||
        (args.values.name?.length ?? 0) > 60)
    )
      throw new ConvexError("Use a name of up to 60 characters.");
    if (args.key === "profile") {
      const keys = profileDomains.flatMap(([id]) => [`${id}-0`, `${id}-1`]);
      if (
        Object.entries(args.values).some(
          ([k, v]) => !keys.includes(k) || !/^(|[0-9]|10)$/.test(v),
        )
      )
        throw new ConvexError(
          "Choose a rating from 0 to 10, or leave it unanswered.",
        );
    }
    if (args.key.startsWith("ledger/") && !args.values.experience?.trim())
      throw new ConvexError(
        "Describe what happened before saving a reflection.",
      );
    const old = await ctx.db
      .query("notes")
      .withIndex("by_principal_key", (q) =>
        q.eq("principal", principal).eq("key", args.key),
      )
      .unique();
    if ((old?.revision ?? 0) !== args.expectedRevision)
      throw new ConvexError(
        "This page changed in another session. Copy your words and reload before saving.",
      );
    const saved = {
      principal,
      key: args.key,
      values: args.values,
      completed: args.key.startsWith("ledger/"),
      revision: (old?.revision ?? 0) + 1,
      updatedAt: Date.now(),
    };
    if (old) await ctx.db.replace(old._id, saved);
    else await ctx.db.insert("notes", saved);
    return {
      key: saved.key,
      values: saved.values,
      completed: saved.completed,
      revision: saved.revision,
      updatedAt: saved.updatedAt,
    };
  },
});
export const saveLesson = mutation({
  args: {
    day: v.number(),
    answers: v.record(v.string(), v.string()),
    completed: v.boolean(),
    expectedRevision: v.number(),
  },
  handler: async (ctx, args) => {
    const principal = await requireProduct(ctx, "course");
    validate(args.answers);
    if (!Number.isInteger(args.day) || args.day < 1 || args.day > 30)
      throw new ConvexError("Choose a lesson from 1 to 30.");
    if (args.completed) {
      const error =
        args.day === 1
          ? completionError(args.answers as Answers)
          : !args.answers.reflection?.trim() || !args.answers.action?.trim()
            ? "Add your reflection and next action before completing."
            : null;
      if (error) throw new ConvexError(error);
    }
    const old = await ctx.db
      .query("lessons")
      .withIndex("by_principal_day", (q) =>
        q.eq("principal", principal).eq("day", args.day),
      )
      .unique();
    if ((old?.revision ?? 0) !== args.expectedRevision)
      throw new ConvexError(
        "This lesson changed in another session. Copy your words and reload before saving.",
      );
    const saved = {
      principal,
      day: args.day,
      answers: args.answers,
      completed: args.completed,
      revision: (old?.revision ?? 0) + 1,
      updatedAt: Date.now(),
    };
    if (old) await ctx.db.replace(old._id, saved);
    else await ctx.db.insert("lessons", saved);
    return {
      day: saved.day,
      answers: saved.answers,
      completed: saved.completed,
      revision: saved.revision,
      updatedAt: saved.updatedAt,
    };
  },
});
export const clearMyNotes = mutation({
  args: { confirmation: v.literal("CLEAR MY NOTES") },
  handler: async (ctx) => {
    const principal = await identity(ctx);
    // Identity owns these records even if access was subsequently revoked.
    for (const row of await ctx.db
      .query("notes")
      .withIndex("by_principal_key", (q) => q.eq("principal", principal))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("lessons")
      .withIndex("by_principal_day", (q) => q.eq("principal", principal))
      .collect())
      await ctx.db.delete(row._id);
  },
});
export const exportMyNotes = query({
  args: {},
  handler: async (ctx) => {
    const principal = await identity(ctx);
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_principal_key", (q) => q.eq("principal", principal))
      .collect();
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_principal_day", (q) => q.eq("principal", principal))
      .collect();
    return {
      version: 1,
      notes: notes.map(({ key, values, updatedAt }) => ({
        key,
        values,
        updatedAt,
      })),
      lessons: lessons.map(({ day, answers, completed, updatedAt }) => ({
        day,
        answers,
        completed,
        updatedAt,
      })),
    };
  },
});

export const addReflection = mutation({
  args: {
    entryId: v.string(),
    kind: v.union(v.literal("daily"), v.literal("weekly")),
    values: v.record(v.string(), v.string()),
    expectedRevision: v.number(),
  },
  handler: async (ctx, args) => {
    const principal = await requireProduct(ctx, "course");
    validate(args.values);
    if (
      !/^[a-zA-Z0-9-]{1,80}$/.test(args.entryId) ||
      !args.values.experience?.trim()
    )
      throw new ConvexError(
        "Describe what happened before saving a reflection.",
      );
    const key = `ledger/${args.entryId}`,
      draftKey = `draft/${args.kind}`;
    const existing = await ctx.db
      .query("notes")
      .withIndex("by_principal_key", (q) =>
        q.eq("principal", principal).eq("key", key),
      )
      .unique();
    if (existing) return; // Idempotent retry after a lost response.
    const draft = await ctx.db
      .query("notes")
      .withIndex("by_principal_key", (q) =>
        q.eq("principal", principal).eq("key", draftKey),
      )
      .unique();
    if ((draft?.revision ?? 0) !== args.expectedRevision)
      throw new ConvexError(
        "Your draft changed in another session. Reload before adding it.",
      );
    await ctx.db.insert("notes", {
      principal,
      key,
      values: { ...args.values, kind: args.kind },
      completed: true,
      revision: 1,
      updatedAt: Date.now(),
    });
    const blank = {
      principal,
      key: draftKey,
      values: {},
      completed: false,
      revision: (draft?.revision ?? 0) + 1,
      updatedAt: Date.now(),
    };
    if (draft) await ctx.db.replace(draft._id, blank);
    else await ctx.db.insert("notes", blank);
  },
});
