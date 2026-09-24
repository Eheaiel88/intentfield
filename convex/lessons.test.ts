/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import { blankAnswers } from "../src/lib/lesson";
const modules = import.meta.glob([
  "./**/*.ts",
  "./**/*.js",
  "!./**/*.test.ts",
  "!./auth.config.ts",
]);
const alice = {
  issuer: "https://web.example",
  subject: "alice",
  tokenIdentifier: "https://web.example|alice",
  email: "same@example.com",
};
const bob = {
  issuer: "https://web.example",
  subject: "bob",
  tokenIdentifier: "https://web.example|bob",
  email: "same@example.com",
};
const whop = {
  issuer: "https://whop-adapter.example",
  subject: "alice",
  tokenIdentifier: "https://whop-adapter.example|alice",
  email: "same@example.com",
};
const filled = {
  ...blankAnswers(),
  focus: "Build a useful service",
  action: "Ask one customer",
  review: "Friday: review their feedback",
};
function setup() {
  return convexTest(schema, modules);
}
test("anonymous callers cannot read or write private work", async () => {
  const t = setup();
  await expect(t.query(api.lessons.dayOne, {})).rejects.toThrow("Sign in");
  await expect(
    t.mutation(api.lessons.saveDayOne, {
      answers: filled,
      completed: false,
      expectedRevision: 0,
    }),
  ).rejects.toThrow("Sign in");
});
test("book/audio access cannot unlock the course", async () => {
  const t = setup();
  for (const sku of ["book", "audio"] as const)
    await t.mutation(internal.grants.applyVerified, {
      principal: alice.tokenIdentifier,
      sku,
      source: sku,
      active: true,
    });
  await expect(
    t.withIdentity(alice).query(api.lessons.dayOne, {}),
  ).rejects.toThrow("Prosperity 30");
});
test("saved work resumes with the same principal and stays isolated across users and channels", async () => {
  const t = setup();
  for (const who of [alice, bob, whop])
    await t.mutation(internal.grants.applyVerified, {
      principal: who.tokenIdentifier,
      sku: "course",
      source: who.tokenIdentifier,
      active: true,
    });
  await t.withIdentity(alice).mutation(api.lessons.saveDayOne, {
    answers: filled,
    completed: true,
    expectedRevision: 0,
  });
  expect(
    await t.withIdentity(alice).query(api.lessons.dayOne, {}),
  ).toMatchObject({ answers: filled, completed: true, revision: 1 });
  expect(await t.withIdentity(bob).query(api.lessons.dayOne, {})).toBeNull();
  expect(await t.withIdentity(whop).query(api.lessons.dayOne, {})).toBeNull();
});
test("expired/revoked grants deny access, independent valid grants preserve it", async () => {
  const t = setup();
  const grant = {
    principal: alice.tokenIdentifier,
    sku: "course" as const,
    source: "one",
    active: true,
  };
  await t.mutation(internal.grants.applyVerified, {
    ...grant,
    validUntil: Date.now() - 1,
  });
  await expect(
    t.withIdentity(alice).query(api.lessons.dayOne, {}),
  ).rejects.toThrow("Prosperity 30");
  await t.mutation(internal.grants.applyVerified, { ...grant, source: "two" });
  await t.mutation(internal.grants.applyVerified, { ...grant, active: false });
  expect(await t.withIdentity(alice).query(api.lessons.dayOne, {})).toBeNull();
  await t.mutation(internal.grants.applyVerified, {
    ...grant,
    source: "two",
    active: false,
  });
  await expect(
    t.withIdentity(alice).mutation(api.lessons.saveDayOne, {
      answers: filled,
      completed: false,
      expectedRevision: 0,
    }),
  ).rejects.toThrow("Prosperity 30");
});
test("retries do not duplicate grants and purchase ownership cannot be reassigned", async () => {
  const t = setup();
  const grant = {
    principal: alice.tokenIdentifier,
    sku: "course" as const,
    source: "membership:one",
    active: true,
  };
  await t.mutation(internal.grants.applyVerified, grant);
  await t.mutation(internal.grants.applyVerified, grant);
  expect(await t.run((ctx) => ctx.db.query("grants").collect())).toHaveLength(
    1,
  );
  await expect(
    t.mutation(internal.grants.applyVerified, {
      ...grant,
      principal: bob.tokenIdentifier,
    }),
  ).rejects.toThrow("cannot be reassigned");
});
test("validation and revision checking prevent empty completion or silent overwrites", async () => {
  const t = setup();
  await t.mutation(internal.grants.applyVerified, {
    principal: alice.tokenIdentifier,
    sku: "course",
    source: "one",
    active: true,
  });
  const member = t.withIdentity(alice);
  await expect(
    member.mutation(api.lessons.saveDayOne, {
      answers: blankAnswers(),
      completed: true,
      expectedRevision: 0,
    }),
  ).rejects.toThrow("chief focus");
  await member.mutation(api.lessons.saveDayOne, {
    answers: filled,
    completed: true,
    expectedRevision: 0,
  });
  await expect(
    member.mutation(api.lessons.saveDayOne, {
      answers: filled,
      completed: true,
      expectedRevision: 0,
    }),
  ).rejects.toThrow("another session");
  await member.mutation(api.lessons.saveDayOne, {
    answers: { ...filled, meaning: "Freedom" },
    completed: true,
    expectedRevision: 1,
  });
  expect(await t.run((ctx) => ctx.db.query("lessons").collect())).toHaveLength(
    1,
  );
  await expect(
    member.mutation(api.lessons.saveDayOne, {
      answers: { ...filled, focus: "x".repeat(6001) },
      completed: false,
      expectedRevision: 2,
    }),
  ).rejects.toThrow("6,000");
});

test("signed-in accounts can inspect only their own course access without a purchase", async () => {
  const t = setup();
  await expect(t.query(api.access.mine, {})).rejects.toThrow("Sign in");
  expect(await t.withIdentity(alice).query(api.access.mine, {})).toEqual({
    course: false, book:false, audio:false, owner:false,
  });
  await t.mutation(internal.grants.applyVerified, {
    principal: bob.tokenIdentifier,
    sku: "course",
    source: "bob-only",
    active: true,
  });
  expect(await t.withIdentity(alice).query(api.access.mine, {})).toEqual({
    course: false, book:false, audio:false, owner:false,
  });
  expect(await t.withIdentity(bob).query(api.access.mine, {})).toEqual({
    course: true, book:false, audio:false, owner:false,
  });
});
