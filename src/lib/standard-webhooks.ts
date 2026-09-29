// Standard Webhooks signature verification (Whop's webhook contract):
// HMAC-SHA256 over `${id}.${timestamp}.${rawBody}` with the `ws_…` secret
// used exactly as given, base64 output, constant-time comparison, and a
// bounded timestamp window. WebCrypto only, so it runs in the Convex
// runtime, the edge test runtime and Node alike. No secrets live here.
const encoder = new TextEncoder();

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function base64ToBytes(value: string): Uint8Array | null {
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

export async function signStandardWebhook(
  id: string,
  timestamp: string,
  payload: string,
  secret: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${id}.${timestamp}.${payload}`),
  );
  let binary = "";
  for (const byte of new Uint8Array(digest)) binary += String.fromCharCode(byte);
  return `v1,${btoa(binary)}`;
}

export async function verifyStandardWebhook({
  id,
  timestamp,
  signatureHeader,
  payload,
  secret,
  toleranceSeconds = 300,
  nowMs = Date.now(),
}: {
  id: string | null;
  timestamp: string | null;
  signatureHeader: string | null;
  payload: string;
  secret: string;
  toleranceSeconds?: number;
  nowMs?: number;
}): Promise<boolean> {
  if (!id || !timestamp || !signatureHeader || !secret) return false;
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(nowMs / 1000 - timestampSeconds) > toleranceSeconds)
    return false;
  const expectedHeader = await signStandardWebhook(
    id,
    timestamp,
    payload,
    secret,
  );
  const expected = base64ToBytes(expectedHeader.slice("v1,".length));
  if (!expected) return false;
  // The header may carry several space-delimited signatures (key rotation).
  for (const candidate of signatureHeader.split(/\s+/)) {
    if (!candidate.startsWith("v1,")) continue;
    const bytes = base64ToBytes(candidate.slice("v1,".length));
    if (bytes && constantTimeEqual(bytes, expected)) return true;
  }
  return false;
}
