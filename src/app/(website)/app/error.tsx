"use client";
import { ButtonLink } from "@/components/brand";
export default function WorkspaceError({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="wrap setup-page">
      <p className="eyebrow">YOUR PRIVATE WORKSPACE</p>
      <h1>We couldn’t open your practice.</h1>
      <p>
        Please check your connection and try again. If your access has changed,
        return to your account to check it.
      </p>
      <div className="actions">
        <button className="button primary" onClick={reset}>
          Try again
        </button>
        <ButtonLink href="/app/today" className="button quiet">
          Return to my account
        </ButtonLink>
      </div>
    </main>
  );
}
