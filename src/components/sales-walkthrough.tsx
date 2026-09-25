import Link from "next/link";
import { Arrow, BookObject, BrandWordmark, ButtonLink, stages } from "./brand";
import { DailyRhythmArt } from "./product-library";
import { PublicShell } from "./public-shell";
import {
  previewHref,
  previewTotal,
  type PreviewSelection,
  type PreviewStep,
} from "@/lib/sales-walkthrough";

const steps: [PreviewStep, string][] = [
  ["book", "Book"],
  ["course", "Course option"],
  ["audio", "Audio option"],
  ["complete", "Your selection"],
];

function Progress({
  step,
  selection,
}: {
  step: PreviewStep;
  selection: PreviewSelection;
}) {
  const current = steps.findIndex(([id]) => id === step);
  return (
    <nav aria-label="Sales walkthrough">
      <ol className="purchase-progress">
        {steps.map(([id, label], index) => (
          <li
            key={id}
            className={
              index === current ? "current" : index < current ? "done" : ""
            }
            aria-current={index === current ? "step" : undefined}
          >
            <span aria-hidden="true">{index < current ? "✓" : index + 1}</span>
            {index < current ? (
              <Link href={previewHref(id, selection)}>{label}</Link>
            ) : (
              label
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function OrderSummary() {
  return (
    <aside className="order-summary">
      <p className="eyebrow">YOUR SAMPLE SELECTION</p>
      <h3>A stronger foundation.</h3>
      <div className="order-row">
        <span>Book + workbook</span>
        <b>$19</b>
      </div>
      <div className="order-total">
        <span>Preview total</span>
        <strong>$19</strong>
      </div>
      <p className="micro">
        USD, before applicable tax. This is a simulated purchase.
      </p>
      <p className="micro">
        Next: choose whether to add the $79 course and the $29 audio companion.
        Both are optional, one-time offers.
      </p>
    </aside>
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
            <span className="pill">ONE-TIME PURCHASE</span>
          </div>
        </div>
        <div className="preview-payment">
          <span className="lock-icon" aria-hidden="true">
            ◇
          </span>
          <div>
            <strong>Preview checkout</strong>
            <p>
              No payment details are needed. Continue to see the two optional
              offers and your final selection page.
            </p>
          </div>
        </div>
        <ButtonLink
          href={previewHref("course", { course: false, audio: false })}
          className="button primary full"
        >
          Simulate $19 book purchase
        </ButtonLink>
        <p className="micro">
          This sample does not process a payment. The complete seven-day book
          and workbook are available in the member application with book access.
        </p>
        <ButtonLink href="/sample" className="text-link">
          Read the opening sample
        </ButtonLink>
      </section>
      <OrderSummary />
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
          <p>
            Your book: $19. With this upgrade: <b>$98</b> before applicable tax.
          </p>
          <ButtonLink
            href={previewHref("audio", { course: true, audio: false })}
            className="button primary full"
          >
            Add Prosperity 30 · $79
          </ButtonLink>
          <Link
            href={previewHref("audio", { course: false, audio: false })}
            className="decline"
          >
            Continue with my book
          </Link>
          <span className="micro">
            Sample selection. No charge or product access is created.
          </span>
        </div>
      </aside>
    </div>
  );
}

function AudioOffer({ selection }: { selection: PreviewSelection }) {
  const beforeAudio = { ...selection, audio: false };
  const withAudio = { ...selection, audio: true };
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
          Add guided affirmations and reflection to{" "}
          {selection.course ? "your book and course" : "your book"}. Let a voice
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
          remain complete without audio.
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
          <p>
            Your selection so far: ${previewTotal(beforeAudio)}.<br />
            With audio: <b>${previewTotal(withAudio)}</b> before applicable tax.
          </p>
          <ButtonLink
            href={previewHref("complete", withAudio)}
            className="button primary full"
          >
            Add the audio companion · $29
          </ButtonLink>
          <Link href={previewHref("complete", beforeAudio)} className="decline">
            Continue without audio
          </Link>
          <span className="micro">
            Sample selection. Two written pilot scripts are available; finished
            recordings are still to come.
          </span>
        </div>
      </aside>
    </div>
  );
}

function PreviewComplete({ selection }: { selection: PreviewSelection }) {
  return (
    <>
      <div className="access-heading">
        <div>
          <p className="eyebrow">YOUR SELECTION / PREVIEW COMPLETE</p>
          <h1 className="flow-title">
            Your next step
            <br />
            has a <span className="warm-emphasis">place to begin.</span>
          </h1>
          <p className="muted">
            Here is what you selected in this walkthrough. Nothing has been
            charged.
          </p>
        </div>
        <div className="selection-total">
          <span>SIMULATED TOTAL</span>
          <strong>${previewTotal(selection)}</strong>
          <small>USD, before applicable tax</small>
        </div>
      </div>
      <div className="product-library walkthrough-products">
        <div className="access-grid">
          <article className="access-card product-card">
            <span className="eyebrow">01 / YOUR FOUNDATION</span>
            <div className="access-art">
              <BookObject mini />
            </div>
            <h2>Book + workbook</h2>
            <p className="product-description">
              Begin with the person behind the plan. Read the opening chapter
              and explore the first worksheet.
            </p>
            <div className="product-actions">
              <ButtonLink href="/sample">Read the book sample</ButtonLink>
              <a
                href="/downloads/intentfield-book-workbook-sample.pdf"
                className="text-link product-sample"
                download
              >
                Download the sample PDF <Arrow />
              </a>
            </div>
            <p className="micro product-note">
              $19 sample selection. The opening sample is available now; the
              full seven-day edition is available inside the member application
              with book access.
            </p>
          </article>
          {selection.course && (
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
                <ButtonLink href="/app/today">Open member workspace</ButtonLink>
              </div>
              <p className="micro product-note">
                $79 sample selection. Member sign-in and existing course access
                are required to open the workspace.
              </p>
            </article>
          )}
          {selection.audio && (
            <article className="access-card product-card">
              <span className="eyebrow">
                {selection.course ? "03" : "02"} / YOUR DAILY RHYTHM
              </span>
              <DailyRhythmArt />
              <h2>Morning &amp; Evening</h2>
              <p className="product-description">
                Read the two pilot scripts and see how audio will support your
                beginning and end of day.
              </p>
              <div className="product-actions">
                <ButtonLink href="/app/audio">Open audio companion</ButtonLink>
              </div>
              <p className="micro product-note">
                $29 sample selection. Member sign-in and existing audio access
                are required. Finished recordings are still to come.
              </p>
            </article>
          )}
        </div>
      </div>
      <div className="walkthrough-finish">
        <div>
          <h2>The walkthrough is complete.</h2>
          <p>
            This sample shows the sales journey. Your selections have not
            created purchases or changed your member access.
          </p>
        </div>
        <ButtonLink href="/checkout" className="button quiet">
          Start the walkthrough again
        </ButtonLink>
      </div>
    </>
  );
}

export function SalesWalkthrough({
  step,
  selection,
}: {
  step: PreviewStep;
  selection: PreviewSelection;
}) {
  const previous =
    step === "course" ? "book" : step === "audio" ? "course" : "audio";
  return (
    <PublicShell walkthrough>
      <div className="flow-wrap wrap sales-walkthrough">
        <Progress step={step} selection={selection} />
        {step === "book" ? (
          <BookCheckout />
        ) : step === "course" ? (
          <CourseOffer />
        ) : step === "audio" ? (
          <AudioOffer selection={selection} />
        ) : (
          <PreviewComplete selection={selection} />
        )}
        {step !== "book" && (
          <div className="walkthrough-back">
            <Link href={previewHref(previous, selection)}>
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
