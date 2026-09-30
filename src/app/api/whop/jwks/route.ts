import { WHOP_SURFACE_KEY_ID } from "@/lib/whop-surface";

// The public half of WHOP_CONVEX_SIGNING_KEY as a JWKS document, for
// reference and as an alternative to the data-URI copy in convex
// env WHOP_CONVEX_JWKS. Public key material only; `d` is stripped. The
// `kid` must match the minted tokens' header or Convex rejects them.
export async function GET() {
  const jwk = process.env.WHOP_CONVEX_SIGNING_KEY;
  if (!jwk) return Response.json({ keys: [] }, { status: 200 });
  const publicJwk = { ...JSON.parse(jwk) };
  delete publicJwk.d;
  return Response.json(
    {
      keys: [
        { ...publicJwk, alg: "ES256", use: "sig", kid: WHOP_SURFACE_KEY_ID },
      ],
    },
    { status: 200, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
