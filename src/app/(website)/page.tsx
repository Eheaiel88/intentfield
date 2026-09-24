import Image from "next/image";
import { PublicShell } from "@/components/public-shell";
import { BookObject, ButtonLink, stages } from "@/components/brand";
import book from "@/lib/book-sample.json";
export default function Home() {
  return (
    <PublicShell>
      <section className="hero">
        <Image
          className="hero-image"
          src="/assets/bridge.png"
          alt="A builder looks across an illuminated architectural bridge toward a city and open horizon."
          fill
          sizes="100vw"
          priority
        />
        <div className="hero-shade" />
        <div className="wrap hero-content">
          <p className="eyebrow">
            <span className="short-rule" />
            THE INNER WORK OF BUILDING WEALTH
          </p>
          <h1>
            BUILD
            <br />
            WEALTH
            <br />
            <span>FROM WITHIN.</span>
          </h1>
          <p className="hero-lead">
            A world of opportunity.
            <br />A stronger foundation inside you.
          </p>
          <p className="hero-copy">
            Discover the prosperity teachings behind the practice. Work with the
            beliefs you bring to money and business. Give your next step a
            direction.
          </p>
          <div className="actions">
            <ButtonLink href="/checkout">
              Get the book + workbook · $19
            </ButtonLink>
            <ButtonLink href="/sample" className="text-link">
              Read a sample
            </ButtonLink>
          </div>
          <p className="micro">
            A seven-day beginning. A book you can return to.
            <br />
            One payment. Digital book, workbook and checklist.
          </p>
        </div>
        <div className="hero-bottom wrap">
          <span>AMBITION / ALIGNMENT / ACTION</span>
          <span>01 — YOUR FOUNDATION</span>
        </div>
      </section>
      <div className="opportunity-strip">
        <div className="wrap">
          <span>MONEY.</span>
          <i>↗</i>
          <span>FREEDOM.</span>
          <i>↗</i>
          <span>MEANING.</span>
          <i>↗</i>
          <span>YOUR OWN DIRECTION.</span>
        </div>
      </div>
      <section id="inside" className="section wrap split book-feature">
        <div>
          <BookObject />
          <span className="object-caption">
            DIGITAL BOOK + PRINTABLE WORKBOOK
          </span>
        </div>
        <div>
          <p className="eyebrow">THE PERSON BEHIND THE PLAN</p>
          <h2>
            You can see
            <br />
            the possibility.
            <br />
            <span className="muted">
              Now meet the
              <br />
              person pursuing it.
            </span>
          </h2>
          <p className="lead">
            The next course. The next business idea. The next promise that this
            is finally your moment.
          </p>
          <p className="muted">
            What happens when you turn toward your own ambition? The Wealth
            Primer gives that question a story, a method, and a place to begin.
          </p>
          <div className="included-lines">
            {[
              "Understand the teachings through everyday stories",
              "Make the practices personal in your workbook",
              "Leave with one direction and a useful next step",
            ].map((t, i) => (
              <span key={t}>
                <b>0{i + 1}</b>
                {t}
              </span>
            ))}
          </div>
          <ButtonLink href="/sample" className="text-link">
            Look inside the book
          </ButtonLink>
        </div>
      </section>
      <section id="method" className="section method-section">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A METHOD YOU CAN RETURN TO</p>
              <h2>
                One ambition.
                <br />
                Six connected stages.
              </h2>
            </div>
            <p>
              Desire, self-image, belief, imagination and gratitude become a
              practice you bring into your life and work.
            </p>
          </div>
          <div className="method-grid">
            {stages.map(([n, t], i) => (
              <article key={n}>
                <span>0{i + 1}</span>
                <h3>{n}</h3>
                <p>{t}</p>
              </article>
            ))}
          </div>
          <p className="method-note">
            A cycle to practice throughout the journey. Return to the stage that
            helps you with the situation in front of you.
          </p>
        </div>
      </section>
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SEVEN DAYS TO BEGIN</p>
            <h2>
              Read a little.
              <br />
              Make it your own.
            </h2>
          </div>
          <p>
            The book and workbook provide a complete first cycle. Continue at
            your own pace, with or without the course.
          </p>
        </div>
        <div className="book-route">
          {book.route.map(([n, t, d]) => (
            <div key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="source-section wrap">
        <p className="eyebrow">ROOTED IN TEACHING. MADE FOR YOUR LIFE.</p>
        <h2>Ideas worth bringing forward.</h2>
        <p>
          The Lazy Man’s Way to Riches and Your Wish Is Your Command inform the
          work on self-image, desire, teachability, conviction, imagination and
          receiving. IntentField brings these ideas into original stories and
          guided practices for money and business.
        </p>
        <p className="micro">
          An original educational program inspired by these works. No author
          endorsement. Spiritual alignment is central to the approach;
          individual experiences and financial results vary.
        </p>
      </section>
      <section className="offer-bottom">
        <div className="wrap split">
          <div>
            <p className="eyebrow">YOUR FIRST STEP</p>
            <h2>
              Give your ambition
              <br />a foundation.
            </h2>
            <p className="muted">
              The Wealth Primer, workbook and action checklist.
              <br />A complete beginning for $19.
            </p>
          </div>
          <div>
            <div className="price">
              $19 <span>one-time digital purchase</span>
            </div>
            <ButtonLink href="/checkout">Begin with the book</ButtonLink>
            <p className="micro">
              Optional course and audio offers follow your purchase.
              <br />
              Your book works on its own.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
