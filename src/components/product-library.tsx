import { Arrow, BookObject, ButtonLink } from "./brand";

type Product = "book" | "course" | "audio";

function ProductAction({
  included,
  price,
  href,
  children,
}: {
  included: boolean;
  price: number;
  href: string;
  children: React.ReactNode;
}) {
  return included ? (
    <ButtonLink href={href}>{children}</ButtonLink>
  ) : (
    <div className="product-unavailable">
      <strong>Not included · ${price} one time</strong>
      <span>Purchases are not open yet.</span>
    </div>
  );
}

function DailyRhythmArt() {
  return (
    <div className="access-art audio-access" aria-hidden="true">
      <svg viewBox="0 0 80 80" focusable="false">
        <circle cx="40" cy="40" r="18" fill="currentColor" />
        <path
          d="M40 1v13m0 52v13M1 40h13m52 0h13M12 12l9 9m38 38 9 9M12 68l9-9m38-38 9-9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        />
      </svg>
      <span>/</span>
      <svg viewBox="0 0 80 80" focusable="false">
        <path
          d="M30 5C14 10 4 25 5 42c1 20 17 35 37 35 16 0 29-10 34-24-19 8-40-1-46-20-3-10-3-19 0-28Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

export function ProductLibrary({
  base,
  access,
  bookPublished,
  recordingCount,
  nextLesson,
  completed,
}: {
  base: string;
  access: Record<Product, boolean>;
  bookPublished: boolean;
  recordingCount: number;
  nextLesson: { day: number; title: string };
  completed: number;
}) {
  return (
    <div className="product-library">
      <div className="access-grid">
        <article className="access-card product-card">
          <span className="eyebrow">01 / YOUR FOUNDATION</span>
          <div className="access-art">
            <BookObject mini />
          </div>
          <h2>Book + workbook</h2>
          <p className="product-description">
            {bookPublished
              ? "Begin with the person behind the plan. Read the book, explore the teachings and make the workbook your own."
              : "Begin with the person behind the plan. Read the opening chapter and make the first worksheet your own."}
          </p>
          <div className="product-actions">
            <ProductAction
              included={access.book}
              price={19}
              href={`${base}/book`}
            >
              Open my book
            </ProductAction>
            <a
              href="/downloads/intentfield-book-workbook-sample.pdf"
              className="text-link product-sample"
              download
            >
              Download the sample PDF <Arrow />
            </a>
          </div>
          <p className="micro product-note">
            {!access.book
              ? "Explore the public sample while product purchases are being prepared."
              : bookPublished
                ? "Your published PDF is available inside the book, alongside your private workbook."
                : "Review sample: opening chapter, worked example, worksheets and checklist. The full seven-day edition is being developed."}
          </p>
        </article>

        <article className="access-card product-card course-access">
          <span className="eyebrow">02 / YOUR DAILY PRACTICE</span>
          <div className="access-art access-number" aria-hidden="true">
            30<span>DAYS / YOUR DIRECTION</span>
          </div>
          <h2>Prosperity 30</h2>
          <p className="product-description">
            Your thirty written lessons, original inner-work tools and a private
            record of your practice.
          </p>
          <div className="product-actions">
            <ProductAction
              included={access.course}
              price={79}
              href={`${base}/today`}
            >
              Enter my workspace
            </ProductAction>
          </div>
          <p className="micro product-note">
            {completed === 30
              ? "Thirty lessons completed. Return to any lesson and continue your practice."
              : `${completed > 0 ? "Continue" : "Start"} with Day ${nextLesson.day}: ${nextLesson.title}`}
          </p>
        </article>

        <article className="access-card product-card">
          <span className="eyebrow">03 / YOUR DAILY RHYTHM</span>
          <DailyRhythmArt />
          <h2>Morning &amp; Evening</h2>
          <p className="product-description">
            {recordingCount > 0
              ? "Make room for intention in the morning and appreciation at night, with guided audio and written practices."
              : "Read the two pilot scripts and see how audio will support your beginning and end of day."}
          </p>
          <div className="product-actions">
            <ProductAction
              included={access.audio}
              price={29}
              href={`${base}/audio`}
            >
              Open my audio companion
            </ProductAction>
          </div>
          <p className="micro product-note">
            {!access.audio
              ? "A morning and evening companion you can use with the book or the course."
              : recordingCount === 2
                ? "Your morning and evening recordings are ready, with the written practices alongside."
                : recordingCount === 1
                  ? "One recording is ready. Both written practices are available; the second recording is still to come."
                  : "Written pilot scripts are available. Finished recordings are still to come."}
          </p>
        </article>
      </div>
    </div>
  );
}
