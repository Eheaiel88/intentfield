import { notFound } from "next/navigation";
import { LocalReview } from "@/components/local-review";
import type { WorkspaceView } from "@/components/workspace";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Review({
  params,
}: {
  params: Promise<{ screen: string[] }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const view = (await params).screen.join("/");
  if (!["today", "course", "lesson/1"].includes(view)) notFound();
  return <LocalReview view={view as WorkspaceView} />;
}
