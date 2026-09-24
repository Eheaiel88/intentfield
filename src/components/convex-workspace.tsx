"use client";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ButtonLink } from "./brand";
import { FullWorkspace } from "./full-workspace";
export function ConvexWorkspace({
  view,
  base,
  accountMenu,
}: {
  view: string;
  base: string;
  accountMenu?: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const access = useQuery(api.access.mine, isAuthenticated ? {} : "skip");
  const snapshot = useQuery(
    api.workspace.snapshot,
    isAuthenticated ? {} : "skip",
  );
  const library = useQuery(api.content.library, isAuthenticated ? {} : "skip");
  if (isLoading)
    return (
      <main id="main" className="member-loading">
        Verifying your session…
      </main>
    );
  if (!isAuthenticated)
    return (
      <main id="main" className="wrap setup-page">
        <h1>Let’s reconnect your account.</h1>
        <p>Your session could not be verified.</p>
        <ButtonLink href="/sign-in">Sign in</ButtonLink>
      </main>
    );
  if (!access || !snapshot || !library)
    return (
      <main id="main" className="member-loading">
        Opening your private workspace…
      </main>
    );
  return (
    <FullWorkspace
      key={view}
      view={view}
      base={base}
      accountMenu={accountMenu}
      access={access}
      snapshot={snapshot}
      library={library}
    />
  );
}
