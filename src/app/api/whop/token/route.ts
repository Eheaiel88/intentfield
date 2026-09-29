import {
  mintWhopConvexToken,
  verifyWhopUserToken,
  whopConvexConfigured,
  WHOP_USER_TOKEN_HEADER,
} from "@/lib/whop-auth";

// Same-origin requests from the embedded app pass through Whop's experience
// proxy, which attaches a fresh x-whop-user-token. After verifying it, this
// endpoint returns a short-lived Convex identity token for the same Whop
// user. An unverified request learns nothing and receives nothing to replay.
export async function GET(request: Request) {
  const noStore = { "Cache-Control": "no-store" };
  if (!whopConvexConfigured())
    return Response.json(
      { error: "The Whop member connection is not configured yet." },
      { status: 503, headers: noStore },
    );
  const session = await verifyWhopUserToken(
    request.headers.get(WHOP_USER_TOKEN_HEADER),
  );
  if (!session)
    return Response.json(
      { error: "This endpoint is only available inside Whop." },
      { status: 401, headers: noStore },
    );
  const minted = await mintWhopConvexToken(session);
  return Response.json(minted, { status: 200, headers: noStore });
}
