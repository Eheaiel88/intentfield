"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  WhopElements,
  Checkout,
  CheckoutElement,
} from "@whop/elements-react";
import { loadWhop } from "@whop/elements";
import { api } from "../../convex/_generated/api";
import { whopCatalog } from "@/lib/whop-catalog";
import { ButtonLink } from "./brand";

// The real payment surface. A signed-in member mints a single-use checkout
// nonce (server-side, bound to their account and this product), and Whop's
// hosted Checkout Element takes the payment with that nonce in the order
// metadata. Access is granted only by the verified payment webhook — never
// from this browser, its callbacks or the URL it lands on afterwards.
type Sku = "book" | "course" | "audio";

export function PurchasePanel({
  sku,
  cta,
  nextHref,
  deferred = false,
}: {
  sku: Sku;
  cta: string;
  nextHref: string;
  // Offers open their checkout on request; the book page opens immediately.
  deferred?: boolean;
}) {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const access = useQuery(api.access.mine, isAuthenticated ? {} : "skip");
  const createNonce = useMutation(api.checkout.createNonce);
  const [open, setOpen] = useState(!deferred);
  const [nonce, setNonce] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const owned = access?.[sku] === true;
  // The nonce only ever exists after mount, so this render path is
  // client-only by construction and window is available.
  const origin = typeof window === "undefined" ? null : window.location.origin;
  useEffect(() => {
    if (!open || owned || nonce || !isAuthenticated) return;
    let cancelled = false;
    createNonce({ sku })
      .then((value) => {
        if (!cancelled) setNonce(value);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, owned, nonce, createNonce, sku, isAuthenticated]);
  if (access === undefined)
    return <p className="micro">Preparing your checkout…</p>;
  if (owned)
    return (
      <div className="purchase-owned">
        <p>✓ Already in your account.</p>
        <ButtonLink href={nextHref} className="button primary full">
          Continue
        </ButtonLink>
      </div>
    );
  if (failed)
    return (
      <p className="micro" role="status">
        Checkout could not start. Reload the page to try again.
      </p>
    );
  if (!open)
    return (
      <button className="button primary full" onClick={() => setOpen(true)}>
        {cta}
      </button>
    );
  if (!nonce || !origin)
    return <p className="micro">Preparing your checkout…</p>;
  const confirmingHref = `${nextHref}?confirming=${sku}`;
  return (
    <div className="purchase-element">
      <WhopElements elements={loadWhop()}>
        <Checkout
          plan={whopCatalog.products[sku].planId}
          metadata={{ checkout_nonce: nonce }}
          returnUrl={`${origin}${confirmingHref}`}
          onComplete={(payload) => {
            if (payload.result === "payment") router.push(confirmingHref);
          }}
        >
          <CheckoutElement
            fallback={<p className="micro">Loading secure checkout…</p>}
          />
        </Checkout>
      </WhopElements>
      <p className="micro">
        Payments are processed securely by Whop. USD, before applicable tax.
      </p>
    </div>
  );
}
