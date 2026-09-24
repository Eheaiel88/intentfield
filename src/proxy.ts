import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
const memberRoute = createRouteMatcher(["/app(.*)"]);
const verifyWebsiteSession = clerkMiddleware(
  async (auth, request) => {
    if (memberRoute(request)) await auth.protect();
  },
  {
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
    authorizedParties: [
      process.env.APP_ORIGIN || "https://myintentfield.com",
      ...[process.env.VERCEL_URL,process.env.VERCEL_BRANCH_URL,process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map(host=>`https://${host}`),
      ...(process.env.NODE_ENV === "development"
        ? ["http://localhost:3000", "http://127.0.0.1:3000"]
        : []),
    ],
  },
);
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  // Missing keys render an explicit setup state; they never grant member access.
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    !process.env.CLERK_SECRET_KEY
  )
    return NextResponse.next();
  return verifyWebsiteSession(request, event);
}
// Whop's route family is intentionally outside Clerk's session boundary.
export const config = {
  matcher: [
    "/",
    "/sample",
    "/checkout",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/app(.*)",
  ],
};
