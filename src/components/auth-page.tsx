import { SignIn, SignUp } from "@clerk/nextjs";
import { Brand, ButtonLink } from "./brand";
import { websiteAuthConfigured } from "@/lib/auth-config";
import { SetupState } from "./setup-state";
export function AuthPage({ signUp = false }: { signUp?: boolean }) {
  if (!websiteAuthConfigured()) return <SetupState />;
  return (
    <div className="wrap">
      <header className="site-nav">
        <Brand />
        <ButtonLink href="/" className="text-link">
          Back to IntentField
        </ButtonLink>
      </header>
      <main id="main" className="auth-page">
        <section className="auth-intro">
          <p className="eyebrow">YOUR DIRECTION / YOUR WORKSPACE</p>
          <h1>
            {signUp ? "Give your next chapter" : "Return to"}
            <br />
            <span>{signUp ? "a place to begin." : "your own direction."}</span>
          </h1>
          <p className="lead">
            Keep your practice, reflections and next steps together.
          </p>
          <p className="muted">
            {signUp
              ? "Create your IntentField account. Your book, course and audio access will follow the products you purchase."
              : "Sign in to return to your IntentField account and the products you own."}
          </p>
          <p className="micro">
            Whop handles all purchases. Creating an account is free.
          </p>
        </section>
        <section
          className="auth-card"
          aria-label={signUp ? "Create an account" : "Sign in to IntentField"}
        >
          {signUp ? (
            <SignUp routing="path" path="/sign-up" />
          ) : (
            <SignIn routing="path" path="/sign-in" />
          )}
        </section>
      </main>
    </div>
  );
}
