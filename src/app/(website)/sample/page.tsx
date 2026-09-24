import { PublicShell } from "@/components/public-shell";
import { BookObject, ButtonLink } from "@/components/brand";
import book from "@/lib/book-sample.json";
export default function Sample() {
  return (
    <PublicShell>
      <div className="wrap reading-wrap">
        <div className="book-heading">
          <div>
            <p className="eyebrow">THE WEALTH PRIMER / READING SAMPLE</p>
            <h1>
              The person
              <br />
              behind the <span>plan.</span>
            </h1>
            <p>A story. A teaching. A direction you can make your own.</p>
          </div>
          <a
            className="button quiet"
            href="/downloads/intentfield-book-workbook-sample.pdf"
            download
          >
            Download sample PDF ↓
          </a>
        </div>
        <div className="reader-layout">
          <aside className="reader-side">
            <BookObject small />
            <p>
              OPENING CHAPTER
              <br />+ WORKBOOK SAMPLE
            </p>
          </aside>
          <article className="reader">
            <p className="reading-label">01 / THE PERSON BEHIND THE PLAN</p>
            {book.opening.map((p, i) => (
              <p key={p} className={i === 0 ? "story-lead" : ""}>
                {p}
              </p>
            ))}
            <h2>{book.teachingTitle}</h2>
            {book.teaching.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <blockquote>
              What do you want your work and money to make possible?
            </blockquote>
            <h2>{book.example.name}</h2>
            <p className="micro">{book.example.context}</p>
            <div className="worked-example">
              {book.fields.map((f) => (
                <div key={f.id}>
                  <span>{f.label}</span>
                  <p>{book.example[f.id as keyof typeof book.example]}</p>
                </div>
              ))}
            </div>
            <details className="source-note">
              <summary>Sources and sample status</summary>
              <p>{book.sourceNote}</p>
              <p>
                This is the opening chapter and first worksheet. The complete
                seven-day edition remains in development.
              </p>
            </details>
            <div className="sample-footer">
              <ButtonLink href="/">Return to the book offer</ButtonLink>
            </div>
          </article>
        </div>
      </div>
    </PublicShell>
  );
}
