// Shared, public identifiers for the Whop embedded surface's Convex identity.
// The issuer becomes part of every Whop-surface principal
// (`<issuer>|<whop user id>`), so it is permanent: changing it would orphan
// members' saved work and grants. It is an identifier, not a fetched URL.
export const WHOP_SURFACE_ISSUER = "https://myintentfield.com/whop";
export const WHOP_SURFACE_AUDIENCE = "convex-whop";
export const whopSurfacePrincipal = (whopUserId: string) =>
  `${WHOP_SURFACE_ISSUER}|${whopUserId}`;
