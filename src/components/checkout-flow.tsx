"use client";
import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Arrow, BookObject, BrandWordmark, ButtonLink, stages } from "./brand";
import { DailyRhythmArt } from "./product-library";
import { MemberProvider } from "./member-provider";
import { PublicShell } from "./public-shell";
import { PurchasePanel } from "./purchase-panel";

// The real sales flow: book checkout, two optional one-time add-on offers,
// then the buyer's actual products. Each step is a separate single-plan
// Whop checkout; declining simply moves forward. Access shown anywhere in
// this flow comes from verified grants, never from URL state — the
// `confirming` query value only chooses status wording.
export type CheckoutStep = "book" | "course" | "audio" | "complete";

const steps: [CheckoutStep, string, string][] = [
  ["book", "Book", "/checkout"],
  ["course", "Course option", "/checkout/course"],
  ["audio", "Audio option", "/checkout/audio"],
  ["complete", "Your products", "/checkout/complete"],
];

function Progress({ step }: { step: CheckoutStep }) {
  const current = steps.findIndex(([id]) => id === step);
  return (
    <nav aria-label="Checkout progress">
      <ol className="purchase-progress">
        {steps.map(([id, label, href], index) => (
          <li
            key={id}
            className={
              index === current ? "current" : index < current ? "done" : ""
            }
            aria-current={index === current ? "step" : undefined}
          >
            <span aria-hidden="true">{index < current ? "✓" : index + 1}</span>
            {index < current ? <Link href={href}>{label}</Link> : label}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function BookCheckout() {
  return (
    <div className="flow-grid">
      <section>
        <p className="eyebrow">YOUR BEGINNING / $19</p>
        <h1 className="flow-title">
          The book.
          <br />
          The work.
          <br />
          <span className="warm-emphasis">Your next step.</span>
        </h1>
        <p className="lead">The Inner Work of Building Wealth</p>
        <p className="muted">
          A seven-day introduction to prosperity, self-image and the person you
          bring to business.
        </p>
        <div className="purchase-product">
          <BookObject mini />
          <div>
            <h3>The Wealth Primer</h3>
            <p>
              Digital book + printable workbook
              <br />
              Worked examples + action checklist
            </p>
            <span className="pill">ONE-TIME PURCHASE · $19</span>
          </div>
        </div>
        <PurchasePanel sku="book" cta="Buy the book · $19" nextHref="/checkout/course" />
        <p className="micro">
          12 months of online access from purchase. Your book opens in the
          member application with the account you are signed in to now.
        </p>
        <ButtonLink href="/sample" className="text-link">
          Read the opening sample first
        </ButtonLink>
      </section>
      <aside className="order-summary">
        <p className="eyebrow">YOUR ORDER</p>
        <h3>A stronger foundation.</h3>
        <div className="order-row">
          <span>Book + workbook</span>
          <b>$19</b>
        </div>
        <div className="order-total">
          <span>Due today</span>
          <strong>$19</strong>
        </div>
        <p className="micro">
          USD, before applicable tax. Payments are processed by Whop.
        </p>
        <p className="micro">
          Next: choose whether to add the $79 course and the $29 audio
          companion. Both are optional, one-time offers.
        </p>
      </aside>
    </div>
  );
}

function CourseOffer() {
  return (
    <div className="upgrade-grid">
      <section>
        <p className="eyebrow">OPTIONAL UPGRADE / PROSPERITY 30</p>
        <h1 className="flow-title">
          Turn the reading
          <br />
          into a <span className="warm-emphasis">daily practice.</span>
        </h1>
        <p className="lead">
          You have the foundation.
          <br />
          Give yourself thirty days to work with it.
        </p>
        <p className="muted">
          The book opens the door. Prosperity 30 guides you through the
          teaching, reflection and real-world action, keeping your direction and
          your work together.
        </p>
        <div className="upgrade-benefits">
          <div>
            <span>01</span>
            <h3>Know what to do today.</h3>
            <p>
              Thirty connected lessons, each with an inner practice and a
              business expression.
            </p>
          </div>
          <div>
            <span>02</span>
            <h3>Work with your own patterns.</h3>
            <p>
              The Self-Image Map, Counter-Intention Map, Desire Studio and other
              original tools.
            </p>
          </div>
          <div>
            <span>03</span>
            <h3>See what is changing.</h3>
            <p>
              Saved reflections, weekly reviews and a private Receiving Ledger.
              Optional guided reflection when you need it.
            </p>
          </div>
        </div>
      </section>
      <aside>
        <div className="workspace-teaser">
          <div className="teaser-top">
            <BrandWordmark /> <span>YOUR WORKSPACE</span>
          </div>
          <span className="eyebrow">DAY 01 / PROSPERITY 30</span>
          <h2>
            Choose your chief
            <br />
            prosperity aim.
          </h2>
          <p>
            One direction.
            <br />A reason it matters.
            <br />
            Your first useful step.
          </p>
          <div className="teaser-cycle">
            {stages.map(([name], index) => (
              <span key={name}>
                0{index + 1} {name}
              </span>
            ))}
          </div>
          <div className="teaser-cta">
            YOUR DAILY PRACTICE <Arrow />
          </div>
        </div>
        <div className="upgrade-price">
          <span>Add the complete course + platform</span>
          <strong>
            $79 <small>additional · one time</small>
          </strong>
          <p>A separate one-time payment, 12 months of online access.</p>
          <PurchasePanel
            sku="course"
            cta="Add Prosperity 30 · $79"
            nextHref="/checkout/audio"
            deferred
          />
          <Link href="/checkout/audio" className="decline">
            Continue with my book
          </Link>
        </div>
      </aside>
    </div>
  );
}

function AudioOffer() {
  return (
    <div className="upgrade-grid">
      <section>
        <p className="eyebrow">OPTIONAL AUDIO COMPANION / $29</p>
        <h1 className="flow-title">
          Begin with intention.
          <br />
          End with <span className="warm-emphasis">appreciation.</span>
        </h1>
        <p className="lead">
          A morning and evening rhythm
          <br />
          for the life you are building.
        </p>
        <p className="muted">
          Add guided affirmations and reflection to your practice. Let a voice
          carry you through desire, imagination, alignment and receiving.
        </p>
        <div className="audio-offer-cards">
          <article className="audio-card morning">
            <span className="audio-symbol" aria-hidden="true">
              ☀
            </span>
            <p className="eyebrow">MORNING / MAKE ROOM</p>
            <h3>
              Enter the day
              <br />
              with direction.
            </h3>
            <p>
              Appreciation, your chief desire, a fulfilled-life scene, and a
              useful next step.
            </p>
          </article>
          <article className="audio-card evening">
            <span className="audio-symbol" aria-hidden="true">
              ☾
            </span>
            <p className="eyebrow">EVENING / RECEIVE THE DAY</p>
            <h3>
              Notice what arrived.
              <br />
              Return to yourself.
            </h3>
            <p>
              Reflect on your experience, practice receiving, and make room for
              rest.
            </p>
          </article>
        </div>
        <p className="micro">
          Designed to work with the book on its own. The written exercises
          remain complete without audio. Two written pilot scripts are
          available today; finished recordings are still to come and will be
          added to the same product.
        </p>
      </section>
      <aside className="audio-upgrade-aside">
        <div className="sound-art" aria-hidden="true">
          {Array.from({ length: 31 }, (_, index) => (
            <i
              key={index}
              style={
                {
                  "--h": `${18 + Math.abs(Math.sin(index * 1.42)) * 90}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <div className="upgrade-price">
          <span>Morning &amp; Evening Audio Affirmations</span>
          <strong>
            $29 <small>additional · one time</small>
          </strong>
          <p>A separate one-time payment, 12 months of online access.</p>
          <PurchasePanel
            sku="audio"
            cta="Add the audio companion · $29"
            nextHref="/checkout/complete"
            deferred
          />
          <Link href="/checkout/complete" className="decline">
            Continue without audio
          </Link>
        </div>
      </aside>
    </div>
  );
}

function ProductsSummary({ confirming }: { confirming: string | null }) {
  const { isAuthenticated } = useConvexAuth();
  const access = useQuery(api.access.mine, isAuthenticated ? {} : "skip");
  if (access === undefined)
    return (
      <p className="micro" role="status">
        Loading your products…
      </p>
    );
  const pending = (sku: "book" | "course" | "audio") =>
    confirming === sku && !access[sku];
  const anything =
    access.book || access.course || access.audio || confirming !== null;
  return (
    <>
      <div className="access-heading">
        <div>
          <p className="eyebrow">YOUR PRODUCTS / INTENTFIELD</p>
          <h1 className="flow-title">
            Your next step
            <br />
            has a <span className="warm-emphasis">place to begin.</span>
          </h1>
          <p className="muted">
            {anything
              ? "Everything your account includes is below. Your receipt arrives by email from Whop."
              : "Your account has no products yet. Begin with the book."}
          </p>
        </div>
      </div>
      <div className="product-library walkthrough-products">
        <div className="access-grid">
          {(access.book || pending("book")) && (
            <article className="access-card product-card">
              <span className="eyebrow">01 / YOUR FOUNDATION</span>
              <div className="access-art">
                <BookObject mini />
              </div>
              <h2>Book + workbook</h2>
              <p className="product-description">
                Begin with the person behind the plan. The complete seven-day
                book and printable workbook.
              </p>
              <div className="product-actions">
                {access.book ? (
                  <ButtonLink href="/app/book">Open my book</ButtonLink>
                ) : (
                  <p className="micro" role="status">
                    Payment received — confirming your purchase. This page
                    updates automatically.
                  </p>
                )}
              </div>
            </article>
          )}
          {(access.course || pending("course")) && (
            <article className="access-card product-card course-access">
              <span className="eyebrow">02 / YOUR DAILY PRACTICE</span>
              <div className="access-art access-number" aria-hidden="true">
                30<span>DAYS / YOUR DIRECTION</span>
              </div>
              <h2>Prosperity 30</h2>
              <p className="product-description">
                Your thirty written lessons, original inner-work tools and a
                private record of your practice.
              </p>
              <div className="product-actions">
                {access.course ? (
                  <ButtonLink href="/app/today">
                    Open member workspace
                  </ButtonLink>
                ) : (
                  <p className="micro" role="status">
                    Payment received — confirming your purchase. This page
                    updates automatically.
                  </p>
                )}
              </div>
            </article>
          )}
          {(access.audio || pending("audio")) && (
            <article className="access-card product-card">
              <span className="eyebrow">03 / YOUR DAILY RHYTHM</span>
              <DailyRhythmArt />
              <h2>Morning &amp; Evening</h2>
              <p className="product-description">
                Your morning and evening companion. Written pilot scripts now;
                recordings arrive in the same product.
              </p>
              <div className="product-actions">
                {access.audio ? (
                  <ButtonLink href="/app/audio">
                    Open audio companion
                  </ButtonLink>
                ) : (
                  <p className="micro" role="status">
                    Payment received — confirming your purchase. This page
                    updates automatically.
                  </p>
                )}
              </div>
            </article>
          )}
        </div>
      </div>
      <div className="walkthrough-finish">
        <div>
          <h2>{anything ? "You are ready to begin." : "Begin with the book."}</h2>
          <p>
            {anything
              ? "Your products stay in your account for 12 months from purchase. Add the course or audio at any time from My Products."
              : "The Wealth Primer is the foundation the other products build on."}
          </p>
        </div>
        <ButtonLink
          href={anything ? "/app/today" : "/checkout"}
          className="button quiet"
        >
          {anything ? "Open my workspace" : "Get the book · $19"}
        </ButtonLink>
      </div>
    </>
  );
}

export function CheckoutFlow({
  step,
  confirming = null,
}: {
  step: CheckoutStep;
  confirming?: string | null;
}) {
  return (
    <PublicShell checkout>
      <div className="flow-wrap wrap sales-walkthrough">
        <Progress step={step} />
        <MemberProvider>
          {step === "book" ? (
            <BookCheckout />
          ) : step === "course" ? (
            <CourseOffer />
          ) : step === "audio" ? (
            <AudioOffer />
          ) : (
            <ProductsSummary confirming={confirming} />
          )}
        </MemberProvider>
        {step !== "book" && (
          <div className="walkthrough-back">
            <Link
              href={steps[steps.findIndex(([id]) => id === step) - 1][2]}
            >
              ←{" "}
              {step === "course"
                ? "Back to book checkout"
                : step === "audio"
                  ? "Back to the course offer"
                  : "Review my audio choice"}
            </Link>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
