import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CheckoutFlow } from "@/components/checkout-flow";
import { SetupState } from "@/components/setup-state";
import { websiteAuthConfigured } from "@/lib/auth-config";

// Real checkout: the buyer signs in (or creates a free account) first, so
// every purchase lands on the account they are looking at.
export const dynamic = "force-dynamic";

export default async function Checkout() {
  if (!websiteAuthConfigured() || !process.env.NEXT_PUBLIC_CONVEX_URL)
    return <SetupState />;
  const session = await auth();
  if (!session.userId) redirect("/sign-up?redirect_url=%2Fcheckout");
  return <CheckoutFlow step="book" />;
}
