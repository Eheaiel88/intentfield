import type { AuthConfig } from "convex/server";
// The Clerk-signed `convex` JWT template has this audience. Convex verifies
// signature, expiry, issuer and audience; browser-supplied IDs are never trusted.
export default {
  providers: [
    { domain: process.env.CLERK_JWT_ISSUER_DOMAIN!, applicationID: "convex" },
  ],
} satisfies AuthConfig;
