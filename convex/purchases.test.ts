/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import { signStandardWebhook } from "../src/lib/standard-webhooks";
import { whopCatalog } from "../src/lib/whop-catalog";
import { whopSurfacePrincipal } from "../src/lib/whop-surface";

const modules = import.meta.glob([
  "./**/*.ts",
  "./**/*.js",
  "!./**/*.test.ts",
  "!./auth.config.ts",
]);

const setup = () => convexTest(schema, modules);
const buyerId = "user_BUYER1";
const buyer = {
  subject: buyerId,
  issuer: "https://myintentfield.com/whop",
  tokenIdentifier: whopSurfacePrincipal(buyerId),
};

function payment(overrides: Record<string, unknown> = {}) {
  return {
    id: "pay_1",
    status: "paid",
    paid_at: "2026-09-29T10:00:00.000Z",
    total: 19,
    currency: "usd",
    user: { id: buyerId },
    plan: { id: whopCatalog.products.book.planId },
    product: { id: whopCatalog.products.book.productId },
    ...overrides,
  };
}

async function deliver(
  t: ReturnType<typeof setup>,
  deliveryId: string,
  eventType: string,
  data: unknown,
) {
  return t.mutation(internal.purchases.applyEvent, {
    deliveryId,
    eventType,
    data,
  });
}

test("a settled payment grants exactly its product for the access term", async () => {
  const t = setup();
  expect(await deliver(t, "msg_1", "payment.succeeded", payment())).toBe(
    "applied:payment",
  );
  const access = await t.withIdentity(buyer).query(api.access.mine, {});
  expect(access).toMatchObject({ book: true, course: false, audio: false });
  const grant = await t.run(async (ctx) =>
    ctx.db
      .query("grants")
      .withIndex("by_source", (q) => q.eq("source", "pay_1"))
      .unique(),
  );
  expect(grant?.validUntil).toBe(
    Date.parse("2026-09-29T10:00:00.000Z") + 365 * 24 * 60 * 60 * 1000,
  );
});

test("a redelivered event changes nothing twice", async () => {
  const t = setup();
  await deliver(t, "msg_1", "payment.succeeded", payment());
  expect(await deliver(t, "msg_1", "payment.succeeded", payment())).toBe(
    "duplicate",
  );
  const purchases = await t.run(async (ctx) =>
    ctx.db.query("purchases").collect(),
  );
  expect(purchases).toHaveLength(1);
});

test("unknown plans, unpaid payments and unhandled events are recorded, not applied", async () => {
  const t = setup();
  expect(
    await deliver(
      t,
      "msg_1",
      "payment.succeeded",
      payment({ plan: { id: "plan_SomeoneElse" } }),
    ),
  ).toContain("ignored:unknown-plan");
  expect(
    await deliver(t, "msg_2", "payment.succeeded", payment({ status: "open" })),
  ).toContain("ignored:not-paid");
  expect(await deliver(t, "msg_3", "membership.activated", {})).toBe(
    "ignored:unhandled-event",
  );
  expect(
    await deliver(t, "msg_4", "refund.created", {
      status: "succeeded",
      payment: { id: "pay_never_seen" },
    }),
  ).toContain("ignored:unknown-payment");
  expect((await t.withIdentity(buyer).query(api.access.mine, {})).book).toBe(
    false,
  );
});

test("a succeeded refund revokes exactly the refunded purchase", async () => {
  const t = setup();
  await deliver(t, "msg_1", "payment.succeeded", payment());
  await deliver(
    t,
    "msg_2",
    "payment.succeeded",
    payment({
      id: "pay_2",
      total: 29,
      plan: { id: whopCatalog.products.audio.planId },
      product: { id: whopCatalog.products.audio.productId },
    }),
  );
  // A pending refund changes nothing.
  expect(
    await deliver(t, "msg_3", "refund.created", {
      status: "pending",
      payment: { id: "pay_2" },
    }),
  ).toBe("ignored:refund-pending");
  expect(
    await t.withIdentity(buyer).query(api.access.mine, {}),
  ).toMatchObject({ book: true, audio: true });
  // A succeeded refund of the audio purchase leaves the book untouched.
  expect(
    await deliver(t, "msg_4", "refund.updated", {
      status: "succeeded",
      payment: { id: "pay_2" },
    }),
  ).toBe("applied:refunded");
  expect(
    await t.withIdentity(buyer).query(api.access.mine, {}),
  ).toMatchObject({ book: true, audio: false });
  // A late redelivery of the original success never resurrects access.
  expect(
    await deliver(
      t,
      "msg_5",
      "payment.succeeded",
      payment({
        id: "pay_2",
        total: 29,
        plan: { id: whopCatalog.products.audio.planId },
      }),
    ),
  ).toBe("applied:payment-updated");
  expect((await t.withIdentity(buyer).query(api.access.mine, {})).audio).toBe(
    false,
  );
});

test("a dispute suspends access and only a won outcome restores it", async () => {
  const t = setup();
  await deliver(t, "msg_1", "payment.succeeded", payment());
  await deliver(t, "msg_2", "dispute.created", {
    status: "needs_response",
    payment: { id: "pay_1" },
  });
  expect((await t.withIdentity(buyer).query(api.access.mine, {})).book).toBe(
    false,
  );
  await deliver(t, "msg_3", "dispute.updated", {
    status: "won",
    payment: { id: "pay_1" },
  });
  expect((await t.withIdentity(buyer).query(api.access.mine, {})).book).toBe(
    true,
  );
  await deliver(t, "msg_4", "dispute.updated", {
    status: "lost",
    payment: { id: "pay_1" },
  });
  expect((await t.withIdentity(buyer).query(api.access.mine, {})).book).toBe(
    false,
  );
});

test("the HTTP receiver rejects bad signatures and applies signed deliveries once", async () => {
  process.env.WHOP_WEBHOOK_SECRET = "ws_test_secret";
  const t = setup();
  const body = JSON.stringify({
    id: "evt_1",
    type: "payment.succeeded",
    data: payment(),
  });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const send = async (signature: string, deliveryId = "msg_http_1") =>
    t.fetch("/whop/webhook", {
      method: "POST",
      body,
      headers: {
        "webhook-id": deliveryId,
        "webhook-timestamp": timestamp,
        "webhook-signature": signature,
      },
    });
  const forged = await send("v1,Zm9yZ2Vk");
  expect(forged.status).toBe(401);
  const good = await signStandardWebhook(
    "msg_http_1",
    timestamp,
    body,
    "ws_test_secret",
  );
  const applied = await send(good);
  expect(applied.status).toBe(200);
  expect(await applied.text()).toBe("applied:payment");
  const replayed = await send(good);
  expect(await replayed.text()).toBe("duplicate");
  expect((await t.withIdentity(buyer).query(api.access.mine, {})).book).toBe(
    true,
  );
});
