/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import { emptyBody } from "../src/lib/content";
const modules = import.meta.glob([
  "./**/*.ts",
  "./**/*.js",
  "!./**/*.test.ts",
  "!./auth.config.ts",
]);
const alice = {
  subject: "a",
  issuer: "https://test",
  tokenIdentifier: "https://test|a",
};
const bob = {
  subject: "b",
  issuer: "https://test",
  tokenIdentifier: "https://test|b",
};
const setup = () => convexTest(schema, modules);
async function grant(
  t: ReturnType<typeof setup>,
  sku: "book" | "course" | "audio",
  principal = alice.tokenIdentifier,
) {
  await t.mutation(internal.grants.applyVerified, {
    principal,
    sku,
    source: principal + sku,
    active: true,
  });
}
test("all workspace reads require identity; each worksheet checks the appropriate product", async () => {
  const t = setup();
  await expect(t.query(api.workspace.snapshot, {})).rejects.toThrow("Sign in");
  await expect(t.query(api.content.library, {})).rejects.toThrow("Sign in");
  const a = t.withIdentity(alice);
  await grant(t, "book");
  await a.mutation(api.workspace.saveNote, {
    key: "workbook",
    values: { focus: "A useful service" },
    expectedRevision: 0,
  });
  await expect(
    a.mutation(api.workspace.saveNote, {
      key: "tool/desire",
      values: { f0: "x" },
      expectedRevision: 0,
    }),
  ).rejects.toThrow("Prosperity 30");
  await expect(
    t.withIdentity(bob).mutation(api.workspace.saveNote, {
      key: "workbook",
      values: { focus: "x" },
      expectedRevision: 0,
    }),
  ).rejects.toThrow("access");
  expect(
    (await t.withIdentity(bob).query(api.workspace.snapshot, {})).notes,
  ).toHaveLength(0);
  await expect(
    a.mutation(api.workspace.saveNote, {
      key: "anything",
      values: {},
      expectedRevision: 0,
    }),
  ).rejects.toThrow("Unknown");
  await expect(
    a.mutation(api.workspace.saveNote, {
      key: "workbook",
      values: {},
      expectedRevision: 0,
    }),
  ).rejects.toThrow("another session");
});
test("the complete book stays independent of course access and private to its reader", async () => {
  const t = setup();
  await grant(t, "book");
  await grant(t, "course", bob.tokenIdentifier);
  await t.mutation(internal.content.seed, {
    items: [
      {
        key: "book/chapter/8",
        sku: "book",
        body: { ...emptyBody(), title: "Final chapter" },
      },
      {
        key: "book/worksheet/23",
        sku: "book",
        body: { ...emptyBody(), title: "Four-week record" },
      },
      {
        key: "book/download/workbook",
        sku: "book",
        body: { ...emptyBody(), title: "Workbook PDF" },
      },
    ],
  });
  const a = t.withIdentity(alice),
    b = t.withIdentity(bob);
  expect(await a.query(api.content.library, {})).toHaveLength(3);
  expect(await b.query(api.content.library, {})).toHaveLength(0);
  await a.mutation(api.workspace.saveNote, {
    key: "book/worksheet/23",
    values: { review: "Private book notes" },
    expectedRevision: 0,
  });
  await expect(
    b.mutation(api.workspace.saveNote, {
      key: "book/worksheet/23",
      values: {},
      expectedRevision: 0,
    }),
  ).rejects.toThrow("Book and workbook");
  expect((await b.query(api.workspace.snapshot, {})).notes).toHaveLength(0);
  await expect(
    a.mutation(api.workspace.saveNote, {
      key: "book/worksheet/24",
      values: {},
      expectedRevision: 0,
    }),
  ).rejects.toThrow("Unknown");
  await a.mutation(api.workspace.saveNote, {
    key: "book/worksheet/3",
    values: { answer1: "0", answer2: "" },
    expectedRevision: 0,
  });
  await expect(
    a.mutation(api.workspace.saveNote, {
      key: "book/worksheet/3",
      values: { answer1: "11" },
      expectedRevision: 1,
    }),
  ).rejects.toThrow("0 to 10");
  expect((await a.query(api.workspace.exportMyNotes, {})).notes).toHaveLength(
    2,
  );
});
test("book companion downloads require PDF media, owner publication and current book access", async () => {
  const t = setup();
  await t.mutation(internal.content.seed, {
    items: [
      {
        key: "book/download/checklist",
        sku: "book",
        body: { ...emptyBody(), title: "Checklist" },
      },
    ],
  });
  await grant(t, "book");
  const a = t.withIdentity(alice);
  const pdf = await t.run((ctx) =>
    ctx.storage.store(new Blob(["%PDF-test"], { type: "application/pdf" })),
  );
  const wrong = await t.run((ctx) =>
    ctx.storage.store(new Blob(["audio"], { type: "audio/mpeg" })),
  );
  await t.run(async (ctx) => {
    // convex-test's storeBlob omits MIME metadata that real uploads retain.
    // Populate only the test fixtures; production system tables are read-only.
    // @ts-expect-error Test-only system table fixture.
    await ctx.db.patch(pdf, { contentType: "application/pdf" });
    // @ts-expect-error Test-only system table fixture.
    await ctx.db.patch(wrong, { contentType: "audio/mpeg" });
  });
  const args = {
    key: "book/download/checklist",
    storageId: pdf,
    fileName: "checklist.pdf",
    expectedRevision: 1,
  };
  await expect(a.mutation(api.content.attachMedia, args)).rejects.toThrow(
    "Owner",
  );
  await t.mutation(internal.content.setOwner, {
    principal: alice.tokenIdentifier,
  });
  await expect(
    a.mutation(api.content.attachMedia, { ...args, storageId: wrong }),
  ).rejects.toThrow("Choose a PDF");
  await a.mutation(api.content.attachMedia, args);
  expect((await a.query(api.content.media, { key: args.key }))?.fileName).toBe(
    "checklist.pdf",
  );
  await expect(a.mutation(api.content.attachMedia, args)).rejects.toThrow(
    "Reload",
  );
  await t.mutation(internal.grants.applyVerified, {
    principal: alice.tokenIdentifier,
    sku: "book",
    source: alice.tokenIdentifier + "book",
    active: false,
  });
  await expect(a.query(api.content.media, { key: args.key })).rejects.toThrow(
    "Book and workbook",
  );
});
test("self-image preserves zero and skipped answers, validates ratings; any lesson persists with correct completion", async () => {
  const t = setup();
  await grant(t, "course");
  const a = t.withIdentity(alice);
  await a.mutation(api.workspace.saveNote, {
    key: "profile",
    values: { "money_identity-0": "0", "money_identity-1": "" },
    expectedRevision: 0,
  });
  expect((await a.query(api.workspace.snapshot, {})).notes[0].values).toEqual({
    "money_identity-0": "0",
    "money_identity-1": "",
  });
  await expect(
    a.mutation(api.workspace.saveNote, {
      key: "profile",
      values: { "money_identity-0": "11" },
      expectedRevision: 1,
    }),
  ).rejects.toThrow("0 to 10");
  await expect(
    a.mutation(api.workspace.saveLesson, {
      day: 1,
      answers: {},
      completed: true,
      expectedRevision: 0,
    }),
  ).rejects.toThrow("chief focus");
  await expect(
    a.mutation(api.workspace.saveLesson, {
      day: 31,
      answers: {},
      completed: false,
      expectedRevision: 0,
    }),
  ).rejects.toThrow("1 to 30");
  await a.mutation(api.workspace.saveLesson, {
    day: 30,
    answers: { reflection: "What changed", action: "One step" },
    completed: true,
    expectedRevision: 0,
  });
  expect((await a.query(api.workspace.snapshot, {})).lessons[0].completed).toBe(
    true,
  );
  await expect(
    a.mutation(api.workspace.saveLesson, {
      day: 30,
      answers: { reflection: "New", action: "Step" },
      completed: true,
      expectedRevision: 0,
    }),
  ).rejects.toThrow("another session");
});
test("export and clear are strictly account scoped and never remove product access", async () => {
  const t = setup();
  for (const p of [alice, bob]) {
    await grant(t, "course", p.tokenIdentifier);
    await t.withIdentity(p).mutation(api.workspace.saveNote, {
      key: "draft/daily",
      values: { experience: p.subject },
      expectedRevision: 0,
    });
  }
  const a = t.withIdentity(alice);
  expect(
    (await a.query(api.workspace.exportMyNotes, {})).notes[0].values.experience,
  ).toBe("a");
  await a.mutation(api.workspace.clearMyNotes, {
    confirmation: "CLEAR MY NOTES",
  });
  expect((await a.query(api.workspace.snapshot, {})).notes).toHaveLength(0);
  expect(
    (await t.withIdentity(bob).query(api.workspace.snapshot, {})).notes,
  ).toHaveLength(1);
  expect((await a.query(api.access.mine, {})).course).toBe(true);
});
test("paid content and owner editing have separate authorization; drafts remain private until published", async () => {
  const t = setup();
  const body = {
    ...emptyBody(),
    title: "A lesson",
    paragraphs: ["Published original"],
  };
  await t.mutation(internal.content.seed, {
    items: [
      { key: "lesson/2", sku: "course", body },
      {
        key: "audio/morning",
        sku: "audio",
        body: { ...body, title: "Morning" },
      },
    ],
  });
  const a = t.withIdentity(alice);
  const b = t.withIdentity(bob);
  await grant(t, "course");
  expect((await a.query(api.content.library, {})).map((c) => c.key)).toEqual([
    "lesson/2",
  ]);
  expect(await b.query(api.content.library, {})).toHaveLength(0);
  await expect(a.query(api.content.ownerList, {})).rejects.toThrow("Owner");
  await expect(a.mutation(api.content.uploadUrl, {})).rejects.toThrow("Owner");
  await t.mutation(internal.content.setOwner, {
    principal: alice.tokenIdentifier,
  });
  await a.mutation(api.content.saveDraft, {
    key: "lesson/2",
    body: { ...body, paragraphs: ["Private draft"] },
    expectedRevision: 1,
  });
  expect((await a.query(api.content.library, {}))[0].body.paragraphs).toEqual([
    "Published original",
  ]);
  await expect(
    a.mutation(api.content.publish, { key: "lesson/2", expectedRevision: 1 }),
  ).rejects.toThrow("latest");
  await a.mutation(api.content.publish, {
    key: "lesson/2",
    expectedRevision: 2,
  });
  expect((await a.query(api.content.library, {}))[0].body.paragraphs).toEqual([
    "Private draft",
  ]);
  await expect(
    b.mutation(api.content.saveDraft, {
      key: "lesson/2",
      body,
      expectedRevision: 3,
    }),
  ).rejects.toThrow("Owner");
  await expect(
    b.query(api.content.media, { key: "audio/morning" }),
  ).rejects.toThrow("access");
});
test("adding a reflection clears its draft atomically and retries cannot duplicate entries", async () => {
  const t = setup();
  await grant(t, "course");
  const a = t.withIdentity(alice);
  await a.mutation(api.workspace.saveNote, {
    key: "draft/weekly",
    values: { experience: "A weekly reflection" },
    expectedRevision: 0,
  });
  const args = {
    entryId: "unique-entry",
    kind: "weekly" as const,
    values: { experience: "A weekly reflection" },
    expectedRevision: 1,
  };
  await a.mutation(api.workspace.addReflection, args);
  await a.mutation(api.workspace.addReflection, args);
  const notes = (await a.query(api.workspace.snapshot, {})).notes;
  expect(notes.filter((n) => n.key.startsWith("ledger/"))).toHaveLength(1);
  expect(notes.find((n) => n.key === "draft/weekly")?.values).toEqual({});
});
