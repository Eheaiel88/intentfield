import Image from "next/image";
import Link from "next/link";
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="IntentField home">
      <Image
        src="/assets/logo.svg"
        alt="INTENTFIELD"
        width={230}
        height={34}
        priority
      />
    </Link>
  );
}
export function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
export function ButtonLink({
  href,
  children,
  className = "button primary",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={className}>
      {children}
      <Arrow />
    </Link>
  );
}
export function BookObject({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`book-object ${small ? "small-book" : ""}`}
      aria-hidden="true"
    >
      <div className="book-brand">
        INTENTFIELD <span>WEALTH PRIMER / 01</span>
      </div>
      <div className="book-title">
        THE INNER
        <br />
        WORK OF
        <br />
        <strong>
          BUILDING
          <br />
          WEALTH.
        </strong>
      </div>
      <div className="book-stairs">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <i key={n} style={{ "--n": n } as React.CSSProperties} />
        ))}
      </div>
      <div className="book-foot">
        A NEW FOUNDATION.
        <br />A LIFE THAT BELONGS TO YOU.
      </div>
    </div>
  );
}
export const stages = [
  ["Desire", "Name the prosperity you want."],
  ["Discover", "Meet the pattern behind a decision."],
  ["Align", "Practice an honest, supportive state."],
  ["Rehearse", "Experience the life. Rehearse the response."],
  ["Build", "Express it through useful work."],
  ["Receive", "Notice, appreciate and learn."],
];
export function MethodStages() {
  return (
    <div className="method-grid-wrap">
      <div className="method-grid">
        {stages.map(([name, description], index) => (
          <article key={name}>
            <span>0{index + 1}</span>
            <h3>{name}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
export function Cycle() {
  return (
    <div className="cycle-strip">
      {stages.map(([n], i) => (
        <span key={n}>
          <b>0{i + 1}</b>
          {n}
        </span>
      ))}
      <small>REPEAT / RETURN / GROW ↻</small>
    </div>
  );
}
