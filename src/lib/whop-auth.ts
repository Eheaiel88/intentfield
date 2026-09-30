import "server-only";
import { importJWK, jwtVerify, SignJWT, type JWTPayload } from "jose";
import { whopCatalog } from "./whop-catalog";
import {
  WHOP_SURFACE_AUDIENCE,
  WHOP_SURFACE_ISSUER,
  WHOP_SURFACE_KEY_ID,
} from "./whop-surface";

// Whop's experience proxy signs x-whop-user-token as an ES256 JWT. The
// issuer, audience rule and public JWK below mirror Whop's own published
// verifier; the key is Whop's public signing key, not a secret. A rotation
// ships by updating WHOP_USER_TOKEN_PUBLIC_JWK before code changes land.
export const WHOP_USER_TOKEN_HEADER = "x-whop-user-token";
export const WHOP_TOKEN_ISSUER = "urn:whopcom:exp-proxy";
const WHOP_PUBLIC_JWK =
  process.env.WHOP_USER_TOKEN_PUBLIC_JWK ||
  '{"kty":"EC","x":"rz8a8vxvexHC0TLT91g7llOdDOsNuYiGEfic4Qhni-E","y":"zH0QblKYToexd5PEIMGXPVJS9AB5smKrW4S_TbiXrOs","crv":"P-256"}';

// Convex cannot verify Whop's URN issuer directly, so the server exchanges a
// verified Whop token for a short-lived Convex identity token signed with our
// own ES256 key. Lifetime is short because the browser can always re-exchange
// through the Whop proxy while the member is actually inside Whop.
const CONVEX_TOKEN_LIFETIME_SECONDS = 15 * 60;

export type WhopSession = {
  userId: string;
  appId: string;
  expiresAt: number | undefined;
};

function payloadToSession(payload: JWTPayload): WhopSession | null {
  if (!payload.sub || typeof payload.aud !== "string") return null;
  if (payload.aud !== whopCatalog.appId) return null;
  return {
    userId: payload.sub,
    appId: payload.aud,
    expiresAt: payload.exp,
  };
}

// Returns null for any missing, malformed, forged, expired or wrong-app
// token. The Whop user id is only ever taken from a verified signature.
export async function verifyWhopUserToken(
  source: Headers | string | null,
): Promise<WhopSession | null> {
  const token =
    typeof source === "string"
      ? source
      : (source?.get(WHOP_USER_TOKEN_HEADER) ?? null);
  if (!token) return null;
  try {
    const key = await importJWK(JSON.parse(WHOP_PUBLIC_JWK), "ES256");
    const { payload } = await jwtVerify(token, key, {
      issuer: WHOP_TOKEN_ISSUER,
      algorithms: ["ES256"],
    });
    return payloadToSession(payload);
  } catch {
    return null;
  }
}

export function whopConvexConfigured() {
  return Boolean(process.env.WHOP_CONVEX_SIGNING_KEY);
}

// Mints the Convex identity token for a verified Whop session. The subject
// is the verified Whop user id, so the Convex principal becomes
// `${WHOP_SURFACE_ISSUER}|user_…` — disjoint from every Clerk principal.
export async function mintWhopConvexToken(
  session: WhopSession,
): Promise<{ token: string; expiresAt: number }> {
  const jwk = process.env.WHOP_CONVEX_SIGNING_KEY;
  if (!jwk) throw new Error("WHOP_CONVEX_SIGNING_KEY is not configured.");
  const key = await importJWK(JSON.parse(jwk), "ES256");
  const expiresAt =
    Math.floor(Date.now() / 1000) + CONVEX_TOKEN_LIFETIME_SECONDS;
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: WHOP_SURFACE_KEY_ID })
    .setIssuer(WHOP_SURFACE_ISSUER)
    .setAudience(WHOP_SURFACE_AUDIENCE)
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(key);
  return { token, expiresAt };
}
