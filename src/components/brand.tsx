import Image from "next/image";
import Link from "next/link";
export function BrandWordmark() {
  return (
    <Image
      src="/assets/logo.svg"
      alt="IntentField"
      width={856}
      height={120}
      priority
    />
  );
}
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="IntentField home">
      <BrandWordmark />
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
export function BookObject({
  small = false,
  mini = false,
}: {
  small?: boolean;
  mini?: boolean;
}) {
  return (
    <div
      className={`book-object ${mini ? "mini" : small ? "small-book" : ""}`}
      aria-hidden="true"
    >
      <Image
        src="/assets/intentfield-book-cover.svg"
        alt=""
        width={400}
        height={564}
      />
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
