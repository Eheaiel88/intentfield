"use client";
import { useAuth, UserButton } from "@clerk/nextjs";
import { ConvexWorkspace } from "./convex-workspace";
export function WebsiteWorkspace({ view }: { view: string }) {
  const { userId } = useAuth();
  return (
    <ConvexWorkspace
      key={userId ?? "signed-out"}
      view={view}
      base="/app"
      accountMenu={<UserButton />}
    />
  );
}
