"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { whopCatalog } from "@/lib/whop-catalog";

// Whop pixel for the public funnel pages only (landing, sample, checkout).
// It never renders in the member area or the embedded Whop surface, and no
// purchase events are ever sent from here: Whop records its own checkouts
// server-side, and sending our own would double count. The only custom
// event is a deduplicated `lead` when a visitor takes the free sample.
declare global {
  interface Window {
    whop?: {
      track: (...args: unknown[]) => void;
      setScope: (...scopes: string[]) => void;
    };
  }
}

// Whop's official loader snippet, verbatim from the pixel guide.
const WHOP_PIXEL_LOADER = `!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");`;

const enabled = process.env.NODE_ENV === "production";

export function WhopPixel() {
  const pathname = usePathname();
  useEffect(() => {
    if (!enabled) return;
    try {
      if (!window.whop) {
        const script = document.createElement("script");
        script.text = WHOP_PIXEL_LOADER;
        document.head.appendChild(script);
      }
      window.whop?.setScope(whopCatalog.accountId);
      window.whop?.track("page");
    } catch {
      // Analytics must never break the page.
    }
  }, [pathname]);
  return null;
}

// The free-sample download as a lead event. The event id is stable per
// browser session so refreshes and repeat clicks do not double count, and
// no personal data is attached.
export function trackSampleLead() {
  if (!enabled) return;
  try {
    let eventId = sessionStorage.getItem("intentfield-lead-event");
    if (!eventId) {
      eventId = `lead_${crypto.randomUUID()}`;
      sessionStorage.setItem("intentfield-lead-event", eventId);
    }
    window.whop?.track("lead", { event_id: eventId });
  } catch {
    // A blocked storage or pixel is never a reason to block the download.
  }
}

export function SampleDownloadLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      className={className}
      href="/downloads/intentfield-book-workbook-sample.pdf"
      download
      onClick={trackSampleLead}
    >
      {children}
    </a>
  );
}
