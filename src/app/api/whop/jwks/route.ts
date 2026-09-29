// The public half of WHOP_CONVEX_SIGNING_KEY as a JWKS document, for
// reference and as an alternative to the data-URI copy in convex
// env WHOP_CONVEX_JWKS. Public key material only; `d` is stripped.
export async function GET() {
  const jwk = process.env.WHOP_CONVEX_SIGNING_KEY;
  if (!jwk) return Response.json({ keys: [] }, { status: 200 });
  const publicJwk = { ...JSON.parse(jwk) };
  delete publicJwk.d;
  return Response.json(
    { keys: [{ ...publicJwk, alg: "ES256", use: "sig" }] },
    { status: 200, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
