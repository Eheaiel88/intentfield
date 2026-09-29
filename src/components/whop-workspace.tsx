"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { ConvexWorkspace } from "./convex-workspace";

// Convex identity for the Whop embedded surface. Same-origin requests travel
// through Whop's experience proxy, which attaches a fresh x-whop-user-token;
// /api/whop/token verifies it server-side and exchanges it for a short-lived
// Convex token. Nothing client-side is trusted as identity.
type Minted = { token: string; expiresAt: number };

async function exchangeToken(): Promise<Minted | null> {
  try {
    const response = await fetch("/api/whop/token", { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as Minted;
  } catch {
    return null;
  }
}

function useWhopSurfaceAuth() {
  const [status, setStatus] = useState<"loading" | "in" | "out">("loading");
  const minted = useRef<Minted | null>(null);
  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      const cached = minted.current;
      const freshEnough =
        cached && cached.expiresAt * 1000 - Date.now() > 60_000;
      if (!forceRefreshToken && freshEnough) return cached.token;
      const next = await exchangeToken();
      minted.current = next;
      setStatus(next ? "in" : "out");
      return next?.token ?? null;
    },
    [],
  );
  useEffect(() => {
    let cancelled = false;
    exchangeToken().then((next) => {
      if (cancelled) return;
      minted.current = next;
      setStatus(next ? "in" : "out");
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return {
    isLoading: status === "loading",
    isAuthenticated: status === "in",
    fetchAccessToken,
  };
}

export function WhopWorkspace({
  view,
  base,
}: {
  view: string;
  base: string;
}) {
  const [client] = useState(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!),
  );
  return (
    <ConvexProviderWithAuth client={client} useAuth={useWhopSurfaceAuth}>
      <ConvexWorkspace view={view} base={base} embedded />
    </ConvexProviderWithAuth>
  );
}
