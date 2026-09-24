import { Brand, ButtonLink } from "./brand";
import { ThemeToggle } from "./theme-toggle";
export function SetupState({ embedded = false }: { embedded?: boolean }) {
  return (
    <div className="wrap">
      <header className="site-nav">
        <Brand />
        <ThemeToggle />
      </header>
      <main id="main" className="setup-page">
        <p className="eyebrow">INTENTFIELD / MEMBER ACCESS</p>
        <h1>
          Your private workspace
          <br />
          is taking shape.
        </h1>
        <p className="lead">
          {embedded
            ? "The Whop member connection is being prepared."
            : "Member sign-in is being prepared."}
        </p>
        <p className="muted">
          This application is not accepting member entries yet. The book sample
          is available while we finish connecting account access and secure
          saving.
        </p>
        <div className="actions">
          <ButtonLink href="/sample">Read the book sample</ButtonLink>
          {process.env.NODE_ENV === "development" && (
            <ButtonLink href="/dev/review/today" className="button quiet">
              Open the local review
            </ButtonLink>
          )}
        </div>
      </main>
    </div>
  );
}
