import type { AuthConfig } from "convex/server";
import {
  WHOP_SURFACE_AUDIENCE,
  WHOP_SURFACE_ISSUER,
} from "../src/lib/whop-surface";
// Two independent identity providers, two disjoint principal namespaces.
// Website: the Clerk-signed `convex` JWT template. Whop surface: a
// short-lived token our server mints only after verifying Whop's own
// x-whop-user-token signature (Convex rejects Whop's URN issuer directly).
// WHOP_CONVEX_JWKS is this deployment's env copy of our public signing key,
// as a data URI. Convex checks signature, expiry, issuer and audience for
// both providers; browser-supplied IDs are never trusted. The two issuers
// can never produce the same tokenIdentifier, which is what keeps website
// and Whop accounts permanently separate.
export default {
  providers: [
    { domain: process.env.CLERK_JWT_ISSUER_DOMAIN!, applicationID: "convex" },
    {
      type: "customJwt",
      issuer: WHOP_SURFACE_ISSUER,
      algorithm: "ES256",
      applicationID: WHOP_SURFACE_AUDIENCE,
      jwks: process.env.WHOP_CONVEX_JWKS!,
    },
  ],
} satisfies AuthConfig;
