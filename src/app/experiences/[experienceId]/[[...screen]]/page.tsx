import { SetupState } from "@/components/setup-state";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
// Neither the experience URL nor x-whop-user-token is trusted as an identity.
// Verified Whop auth and an allowlisted experience/product are required next.
export default function WhopEntry() {
  return <SetupState embedded />;
}
