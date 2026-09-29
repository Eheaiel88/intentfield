import { describe, expect, test } from "vitest";
import {
  signStandardWebhook,
  verifyStandardWebhook,
} from "./standard-webhooks";

const secret = "ws_test_secret_value";
const payload = JSON.stringify({ type: "payment.succeeded", data: { id: 1 } });
const now = 1_790_000_000_000;
const timestamp = String(Math.floor(now / 1000));

async function signed() {
  return signStandardWebhook("msg_1", timestamp, payload, secret);
}

describe("verifyStandardWebhook", () => {
  test("accepts a correctly signed delivery", async () => {
    expect(
      await verifyStandardWebhook({
        id: "msg_1",
        timestamp,
        signatureHeader: await signed(),
        payload,
        secret,
        nowMs: now,
      }),
    ).toBe(true);
  });

  test("accepts when one of several signatures matches", async () => {
    const header = `v1,${btoa("wrong-signature-bytes")} ${await signed()}`;
    expect(
      await verifyStandardWebhook({
        id: "msg_1",
        timestamp,
        signatureHeader: header,
        payload,
        secret,
        nowMs: now,
      }),
    ).toBe(true);
  });

  test.each([
    ["a tampered body", { payload: payload + " " }],
    ["a wrong secret", { secret: "ws_other" }],
    ["a wrong id", { id: "msg_2" }],
    ["a stale timestamp", { nowMs: now + 6 * 60 * 1000 }],
    ["a future timestamp", { nowMs: now - 6 * 60 * 1000 }],
    ["a garbled header", { signatureHeader: "v1,%%%" }],
    ["a missing header", { signatureHeader: null }],
    ["a non-numeric timestamp", { timestamp: "yesterday" }],
  ] as const)("rejects %s", async (_name, override) => {
    expect(
      await verifyStandardWebhook({
        id: "msg_1",
        timestamp,
        signatureHeader: await signed(),
        payload,
        secret,
        nowMs: now,
        ...override,
      }),
    ).toBe(false);
  });
});
