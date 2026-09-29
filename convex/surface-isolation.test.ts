/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import {
  WHOP_SURFACE_ISSUER,
  whopSurfacePrincipal,
} from "../src/lib/whop-surface";

const modules = import.meta.glob([
  "./**/*.ts",
  "./**/*.js",
  "!./**/*.test.ts",
  "!./auth.config.ts",
]);

// The website (Clerk) and the Whop embedded surface are two separate account
// databases by decision (docs/WHOP-INTEGRATION-PLAN.md, Phase 2). The same
// person — same verified email — gets two independent workspaces. These
// tests lock that invariant: nothing may read or write across the namespace
// boundary, and email must never act as an identity key.
const email = "same.person@example.com";
const websiteMember = {
  subject: "user_clerk1",
  issuer: "https://clerk.test",
  tokenIdentifier: "https://clerk.test|user_clerk1",
  email,
  emailVerified: true,
};
const whopMember = {
  subject: "user_whop1",
  issuer: WHOP_SURFACE_ISSUER,
  tokenIdentifier: whopSurfacePrincipal("user_whop1"),
  email,
  emailVerified: true,
};

const setup = () => convexTest(schema, modules);

test("the same verified email on both surfaces yields two independent workspaces", async (): Promise<void> => {
  const t = setup();
  const website = t.withIdentity(websiteMember);
  const whop = t.withIdentity(whopMember);

  // A website purchase entitles only the website account.
  await t.mutation(internal.grants.applyVerified, {
    principal: websiteMember.tokenIdentifier,
    sku: "book",
    source: "website-order-1",
    active: true,
  });
  expect(await website.query(api.access.mine, {})).toMatchObject({
    book: true,
    course: false,
    audio: false,
  });
  expect(await whop.query(api.access.mine, {})).toMatchObject({
    book: false,
    course: false,
    audio: false,
  });
  await website.mutation(api.workspace.saveNote, {
    key: "workbook",
    values: { focus: "Website draft, private to the website account" },
    expectedRevision: 0,
  });
  await expect(
    whop.mutation(api.workspace.saveNote, {
      key: "workbook",
      values: { focus: "x" },
      expectedRevision: 0,
    }),
  ).rejects.toThrow("access");
  expect((await whop.query(api.workspace.snapshot, {})).notes).toHaveLength(0);

  // A Whop-surface entitlement (Phase 3 webhook writes this principal)
  // unlocks the Whop workspace without touching the website one.
  await t.mutation(internal.grants.applyVerified, {
    principal: whopMember.tokenIdentifier,
    sku: "book",
    source: "whop-order-1",
    active: true,
  });
  await whop.mutation(api.workspace.saveNote, {
    key: "workbook",
    values: { focus: "Whop draft, private to the Whop account" },
    expectedRevision: 0,
  });
  const websiteNotes = (await website.query(api.workspace.snapshot, {})).notes;
  const whopNotes = (await whop.query(api.workspace.snapshot, {})).notes;
  expect(websiteNotes).toHaveLength(1);
  expect(whopNotes).toHaveLength(1);
  expect(websiteNotes[0].values.focus).toContain("Website draft");
  expect(whopNotes[0].values.focus).toContain("Whop draft");
});

test("a matching subject under another issuer is still a different account", async (): Promise<void> => {
  // A Clerk-side subject that happens to equal a Whop user id must not
  // collide: the principal embeds the issuer.
  const imitator = {
    subject: "user_whop1",
    issuer: "https://clerk.test",
    tokenIdentifier: "https://clerk.test|user_whop1",
    email,
  };
  expect(imitator.tokenIdentifier).not.toBe(whopMember.tokenIdentifier);
  const t = setup();
  await t.mutation(internal.grants.applyVerified, {
    principal: whopMember.tokenIdentifier,
    sku: "course",
    source: "whop-order-2",
    active: true,
  });
  expect(
    (await t.withIdentity(imitator).query(api.access.mine, {})).course,
  ).toBe(false);
  expect((await t.withIdentity(whopMember).query(api.access.mine, {})).course).toBe(
    true,
  );
});

test("owner status never crosses the surface boundary", async (): Promise<void> => {
  const t = setup();
  await t.run(async (ctx) => {
    await ctx.db.insert("owners", {
      principal: websiteMember.tokenIdentifier,
    });
  });
  expect((await t.withIdentity(websiteMember).query(api.access.mine, {})).owner).toBe(
    true,
  );
  expect((await t.withIdentity(whopMember).query(api.access.mine, {})).owner).toBe(
    false,
  );
});
