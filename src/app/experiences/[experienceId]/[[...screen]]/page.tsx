import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { SetupState } from "@/components/setup-state";
import { WhopWorkspace } from "@/components/whop-workspace";
import { verifyWhopUserToken, whopConvexConfigured } from "@/lib/whop-auth";
import { validView } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

// The Whop embedded surface. Identity comes only from the signed
// x-whop-user-token that Whop's experience proxy attaches; the experienceId
// in the URL is routing, never authorization. Product access is decided by
// this member's own grants inside Convex.
export default async function WhopEntry({
  params,
}: {
  params: Promise<{ experienceId: string; screen?: string[] }>;
}) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL || !whopConvexConfigured())
    return <SetupState embedded />;
  const session = await verifyWhopUserToken(await headers());
  if (!session)
    return (
      <div className="wrap">
        <main id="main" className="setup-page">
          <p className="eyebrow">INTENTFIELD / MEMBER ACCESS</p>
          <h1>
            This workspace opens
            <br />
            inside Whop.
          </h1>
          <p className="lead">
            Open IntentField from your Whop sidebar to enter your private
            workspace.
          </p>
          <p className="muted">
            If you arrived here from inside Whop, your session may have
            expired. Close this view and open IntentField again.
          </p>
        </main>
      </div>
    );
  const { experienceId, screen } = await params;
  const base = `/experiences/${experienceId}`;
  if (!screen?.length) redirect(`${base}/today`);
  const view = screen.join("/");
  if (!validView(view)) notFound();
  return <WhopWorkspace view={view} base={base} />;
}
