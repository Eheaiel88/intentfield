import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CheckoutFlow } from "@/components/checkout-flow";
import { SetupState } from "@/components/setup-state";
import { websiteAuthConfigured } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

export default async function CheckoutComplete({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!websiteAuthConfigured() || !process.env.NEXT_PUBLIC_CONVEX_URL)
    return <SetupState />;
  const session = await auth();
  if (!session.userId)
    redirect("/sign-up?redirect_url=%2Fcheckout%2Fcomplete");
  const { confirming } = await searchParams;
  // Display wording only: access always comes from verified grants.
  const pending =
    typeof confirming === "string" &&
    ["book", "course", "audio"].includes(confirming)
      ? confirming
      : null;
  return <CheckoutFlow step="complete" confirming={pending} />;
}
