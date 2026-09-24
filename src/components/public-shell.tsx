import Link from "next/link";
import { Brand, ButtonLink } from "./brand";
import { ThemeToggle } from "./theme-toggle";
export function PublicShell({
  children,
  walkthrough = false,
}: {
  children: React.ReactNode;
  walkthrough?: boolean;
}) {
  return (
    <>
      {walkthrough && (
        <div className="edition walkthrough-banner">
          <span className="signal" aria-hidden="true" />
          SAMPLE SALES WALKTHROUGH
          <span>No payment is taken. Your account access stays unchanged.</span>
        </div>
      )}
      <header className="site-nav wrap">
        <Brand />
        {walkthrough ? (
          <span className="nav-caption">BUILD WEALTH FROM WITHIN.</span>
        ) : (
          <nav aria-label="Website navigation">
            <Link href="/#inside">Inside the book</Link>
            <Link href="/#method">The method</Link>
          </nav>
        )}
        <ThemeToggle />
        <div className="site-account">
          {walkthrough ? (
            <Link href="/" className="member-sign-in">
              Back to the landing page
            </Link>
          ) : (
            <>
              <Link
                href="/app/today"
                className="member-sign-in"
                prefetch={false}
              >
                Member sign in
              </Link>
              <ButtonLink href="/checkout" className="button primary small">
                Get the book · $19
              </ButtonLink>
            </>
          )}
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer wrap">
        <Brand />
        <p>The inner work of building wealth.</p>
        <span>INTENTFIELD / 2026</span>
      </footer>
      {process.env.NODE_ENV === "development" && !walkthrough && (
        <ButtonLink
          href="/dev/review/today"
          className="button quiet small preview-badge"
        >
          Review the application
        </ButtonLink>
      )}
    </>
  );
}
