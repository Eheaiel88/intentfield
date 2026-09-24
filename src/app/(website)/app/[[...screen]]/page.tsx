import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { SetupState } from "@/components/setup-state";
import { WebsiteWorkspace } from "@/components/website-workspace";
import { websiteAuthConfigured } from "@/lib/auth-config";
import { validView } from "@/lib/content";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function MemberEntry({
  params,
}: {
  params: Promise<{ screen?: string[] }>;
}) {
  if (!websiteAuthConfigured() || !process.env.NEXT_PUBLIC_CONVEX_URL)
    return <SetupState />;
  const session = await auth();
  if (!session.userId) redirect("/sign-in");
  const { screen } = await params;
  if (!screen?.length) redirect("/app/today");
  const view = screen.join("/");
  if (!validView(view)) notFound();
  return <WebsiteWorkspace view={view} />;
}
