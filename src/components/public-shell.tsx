import Link from "next/link";
import { Brand, ButtonLink } from "./brand";
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-nav wrap">
        <Brand />
        <nav aria-label="Website navigation">
          <Link href="/#inside">Inside the book</Link>
          <Link href="/#method">The method</Link>
        </nav>
        <div className="site-account">
          <Link href="/app/today" className="member-sign-in" prefetch={false}>
            Member sign in
          </Link>
          <ButtonLink href="/checkout" className="button primary small">
            Get the book · $19
          </ButtonLink>
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
      {process.env.NODE_ENV === "development" && (
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
