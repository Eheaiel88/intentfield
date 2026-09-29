import { beforeAll, describe, expect, test } from "vitest";
import { exportJWK, generateKeyPair, importJWK, jwtVerify, SignJWT } from "jose";
import { whopCatalog } from "./whop-catalog";
import { WHOP_SURFACE_AUDIENCE, WHOP_SURFACE_ISSUER } from "./whop-surface";

// The adapter reads its keys from the environment at import time, so the
// test keys are installed before the module under test is loaded.
let whopAuth: typeof import("./whop-auth");
let signWhopToken: (
  claims: Partial<{ sub: string; aud: string; iss: string; exp: number }>,
) => Promise<string>;

beforeAll(async () => {
  const proxy = await generateKeyPair("ES256", { extractable: true });
  const mint = await generateKeyPair("ES256", { extractable: true });
  process.env.WHOP_USER_TOKEN_PUBLIC_JWK = JSON.stringify(
    await exportJWK(proxy.publicKey),
  );
  process.env.WHOP_CONVEX_SIGNING_KEY = JSON.stringify(
    await exportJWK(mint.privateKey),
  );
  whopAuth = await import("./whop-auth");
  signWhopToken = async (claims) => {
    const jwt = new SignJWT({})
      .setProtectedHeader({ alg: "ES256" })
      .setIssuer(claims.iss ?? "urn:whopcom:exp-proxy")
      .setAudience(claims.aud ?? whopCatalog.appId)
      .setIssuedAt()
      .setExpirationTime(claims.exp ?? Math.floor(Date.now() / 1000) + 300);
    if (claims.sub !== undefined) jwt.setSubject(claims.sub);
    return jwt.sign(proxy.privateKey);
  };
});

describe("verifyWhopUserToken", () => {
  test("accepts a token signed for this app and returns its user", async () => {
    const token = await signWhopToken({ sub: "user_TEST123" });
    const session = await whopAuth.verifyWhopUserToken(token);
    expect(session).not.toBeNull();
    expect(session!.userId).toBe("user_TEST123");
    expect(session!.appId).toBe(whopCatalog.appId);
  });

  test("reads the token from request headers", async () => {
    const token = await signWhopToken({ sub: "user_HEADER" });
    const headers = new Headers({ "x-whop-user-token": token });
    const session = await whopAuth.verifyWhopUserToken(headers);
    expect(session?.userId).toBe("user_HEADER");
  });

  test.each([
    ["another app's audience", { sub: "user_A", aud: "app_SomeoneElse" }],
    ["a foreign issuer", { sub: "user_A", iss: "urn:elsewhere" }],
    [
      "an expired token",
      { sub: "user_A", exp: Math.floor(Date.now() / 1000) - 60 },
    ],
    ["a missing subject", {}],
  ] as const)("rejects %s", async (_name, claims) => {
    const token = await signWhopToken(claims);
    expect(await whopAuth.verifyWhopUserToken(token)).toBeNull();
  });

  test("rejects garbage, a missing header and a token signed by another key", async () => {
    expect(await whopAuth.verifyWhopUserToken("not-a-jwt")).toBeNull();
    expect(await whopAuth.verifyWhopUserToken(new Headers())).toBeNull();
    const stranger = await generateKeyPair("ES256");
    const forged = await new SignJWT({})
      .setProtectedHeader({ alg: "ES256" })
      .setIssuer("urn:whopcom:exp-proxy")
      .setAudience(whopCatalog.appId)
      .setSubject("user_FORGED")
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(stranger.privateKey);
    expect(await whopAuth.verifyWhopUserToken(forged)).toBeNull();
  });
});

describe("mintWhopConvexToken", () => {
  test("mints a short-lived token Convex can verify for the same user", async () => {
    const minted = await whopAuth.mintWhopConvexToken({
      userId: "user_TEST123",
      appId: whopCatalog.appId,
      expiresAt: undefined,
    });
    const publicJwk = { ...JSON.parse(process.env.WHOP_CONVEX_SIGNING_KEY!) };
    delete publicJwk.d;
    const key = await importJWK(publicJwk, "ES256");
    const { payload } = await jwtVerify(minted.token, key, {
      issuer: WHOP_SURFACE_ISSUER,
      audience: WHOP_SURFACE_AUDIENCE,
    });
    expect(payload.sub).toBe("user_TEST123");
    expect(payload.exp).toBe(minted.expiresAt);
    const lifetime = minted.expiresAt - Math.floor(Date.now() / 1000);
    expect(lifetime).toBeGreaterThan(0);
    expect(lifetime).toBeLessThanOrEqual(15 * 60);
  });
});
