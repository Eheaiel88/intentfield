"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MemberShell } from "./member-shell";
import { ButtonLink, Cycle, MethodStages } from "./brand";
import { SavedForm, type Field } from "./saved-form";
import { ContentStudio } from "./content-studio";
import { LessonGuide } from "./lesson-guide";
import { ProductLibrary } from "./product-library";
import type { ContentItem, Note } from "@/lib/content";
import {
  profileDomains,
  isBookChapter,
  isBookWorksheet,
  isBookDownload,
} from "@/lib/content";
import outline from "@/lib/course-outline.json";
import book from "@/lib/book-sample.json";
type Lesson = {
  day: number;
  answers: Record<string, string>;
  completed: boolean;
  revision: number;
  updatedAt: number;
};
type Access = {
  book: boolean;
  course: boolean;
  audio: boolean;
  owner: boolean;
};
export function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
function Sources({ item }: { item: ContentItem }) {
  return (
    <details className="source-note">
      <summary>Where this practice comes from</summary>
      <p>
        Original IntentField teaching adapted from the reviewed V2.1 sources.
      </p>
      <p>{item.body.sources.join("; ")}</p>
    </details>
  );
}
function Media({ item }: { item: ContentItem }) {
  const media = useQuery(api.content.media, { key: item.key });
  if (!media?.url)
    return (
      <p className="micro">
        {item.sku === "book"
          ? "The final production PDF will appear here when published. The opening sample is available below."
          : "Written pilot available. The recording will appear here when published."}
      </p>
    );
  return item.sku === "book" ? (
    <a
      className="button primary"
      href={media.url}
      download={media.fileName}
      target="_blank"
      rel="noreferrer"
    >
      {item.key === "book" ? "Download the book PDF" : item.body.title} ↓
    </a>
  ) : (
    <audio
      controls
      preload="metadata"
      src={media.url}
      aria-label={item.body.title}
    />
  );
}
export function FullWorkspace({
  view,
  base,
  accountMenu,
  access,
  snapshot,
  library,
}: {
  view: string;
  base: string;
  accountMenu?: React.ReactNode;
  access: Access;
  snapshot: { notes: Note[]; lessons: Lesson[] };
  library: ContentItem[];
}) {
  const router = useRouter();
  const saveNote = useMutation(api.workspace.saveNote);
  const saveLesson = useMutation(api.workspace.saveLesson);
  const note = (key: string) =>
    snapshot.notes.find((n) => n.key === key) ?? null;
  const item = (key: string) => library.find((c) => c.key === key);
  const completed = snapshot.lessons.filter((l) => l.completed).length;
  const next =
    outline.find(
      (d) => !snapshot.lessons.some((l) => l.day === d.day && l.completed),
    ) ?? outline[29];
  const first = snapshot.lessons.find((l) => l.day === 1);
  const href = (path: string) => `${base}/${path}`;
  const active = view.startsWith("lesson")
    ? "course"
    : view.startsWith("tool")
      ? "tools"
      : view.startsWith("book")
        ? "book"
        : view.startsWith("audio")
          ? "audio"
          : view;
  const product = view.startsWith("book")
    ? "book"
    : view.startsWith("audio")
      ? "audio"
      : ["settings", "purchases", "admin"].includes(view)
        ? null
        : "course";
  function noteForm(key: string, fields: Field[], children?: React.ReactNode) {
    return (
      <SavedForm
        key={key}
        record={note(key)}
        fields={fields}
        onSave={(values, expectedRevision) =>
          saveNote({ key, values, expectedRevision })
        }
      >
        {children}
      </SavedForm>
    );
  }
  let content: React.ReactNode;
  if (product && !access[product])
    content = (
      <>
        <Heading
          eyebrow="YOUR INTENTFIELD ACCOUNT"
          title="Your next step awaits."
          description={
            product === "course"
              ? "Prosperity 30 isn’t included in your account yet."
              : `${product === "book" ? "The book and workbook" : "Morning & Evening audio"} isn’t included in your account yet.`
          }
        />
        <p>
          Purchases are not open while we connect Whop. Your available products
          are ready below.
        </p>
        <ButtonLink href={href("purchases")}>View my products</ButtonLink>
        <ButtonLink className="text-link" href="/sample">
          Read the book sample
        </ButtonLink>
      </>
    );
  else if (view === "today")
    content = (
      <>
        <Heading
          eyebrow="YOUR NEXT CHAPTER"
          title="Build wealth. Start within."
          description="One direction. A daily practice. Your own experience to learn from."
        />
        <div className="today-grid">
          <section className="today-main">
            <div className="card-top">
              <span className="pill">
                DAY {String(next.day).padStart(2, "0")} / 30
              </span>
              <span className="micro">10–15 MIN + YOUR ACTION</span>
            </div>
            <p className="eyebrow">
              {completed === 30
                ? "YOUR FIRST CYCLE IS COMPLETE"
                : "TODAY’S LESSON"}
            </p>
            <h2>{next.title}.</h2>
            <p>{next.inner}</p>
            <ButtonLink href={href(`lesson/${next.day}`)}>
              {completed === 30
                ? "Revisit the practice"
                : snapshot.lessons.some((l) => l.day === next.day)
                  ? "Continue today’s practice"
                  : "Begin today’s practice"}
            </ButtonLink>
            <div className="today-takeaway">
              <span>YOU’LL LEAVE WITH</span>
              <p>
                {item(`lesson/${next.day}`)?.body.action ||
                  "A clearer direction, a practice and one useful next step."}
              </p>
            </div>
          </section>
          <aside className="direction-card">
            <p className="eyebrow">MY CHIEF PROSPERITY AIM</p>
            <span className="direction-mark">↗</span>
            <h3>
              {first?.answers.focus ||
                "What do you want your work and money to make possible?"}
            </h3>
            <p>
              {first?.answers.meaning ||
                "Give your attention a direction that belongs to you."}
            </p>
            <ButtonLink className="text-link" href={href("lesson/1")}>
              {first?.answers.focus
                ? "Return to my direction"
                : "Set my direction"}
            </ButtonLink>
          </aside>
        </div>
        <section className="dashboard-cycle">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE PRACTICE YOU RETURN TO</p>
              <h2>Six stages. One connected method.</h2>
            </div>
            <span className="micro">{completed} OF 30 LESSONS COMPLETED</span>
          </div>
          <MethodStages />
          <p className="method-note">
            These stages repeat within the daily work. Choose what helps with
            the situation in front of you.
          </p>
        </section>
        <div className="quick-grid">
          {[
            [
              "tools",
              "Work through a hesitation",
              "Choose an inner work tool.",
            ],
            [
              "review",
              "Notice what is changing",
              "Pause and review your experience.",
            ],
            [
              "ledger",
              "Receive the day",
              "Record what happened and what it means.",
            ],
          ].map(([path, title, desc]) => (
            <ButtonLink key={path} href={href(path)} className="panel">
              <h3>{title}</h3>
              <p>{desc}</p>
            </ButtonLink>
          ))}
        </div>
      </>
    );
  else if (view === "course")
    content = (
      <>
        <Heading
          eyebrow="PROSPERITY 30"
          title="Thirty days. One direction of your own."
          description="Read the teaching, make it your own and take one useful step. Return to any lesson at your own pace."
        />
        <div className="course-intro">
          <Cycle />
        </div>
        <div className="lesson-list">
          {outline.map((d) => {
            const done = snapshot.lessons.find(
              (l) => l.day === d.day,
            )?.completed;
            return (
              <ButtonLink
                key={d.day}
                className="lesson-row"
                href={href(`lesson/${d.day}`)}
              >
                <span className={`lesson-day ${done ? "complete" : ""}`}>
                  {done ? "✓" : String(d.day).padStart(2, "0")}
                </span>
                <div>
                  <h3>{item(`lesson/${d.day}`)?.body.title || d.title}</h3>
                  <p>{item(`lesson/${d.day}`)?.body.summary || d.inner}</p>
                </div>
                <span className="lesson-status">
                  {done ? "COMPLETE" : "OPEN LESSON"}
                </span>
              </ButtonLink>
            );
          })}
        </div>
      </>
    );
  else if (view.startsWith("lesson/")) {
    const day = Number(view.split("/")[1]);
    const lesson = item(`lesson/${day}`);
    const saved = snapshot.lessons.find((l) => l.day === day);
    const body = lesson?.body;
    const fields: Field[] =
      day === 1
        ? [
            ...book.fields.map((f) => ({
              ...f,
              required: ["focus", "action", "review"].includes(f.id),
            })),
            { id: "appreciation", label: "Something I appreciate today" },
          ]
        : [
            {
              id: "reflection",
              label:
                body?.reflection || "What does this teaching bring up for me?",
              required: true,
            },
            {
              id: "action",
              label: "One action I will take",
              placeholder: body?.action,
              required: true,
            },
            { id: "appreciation", label: "Something I appreciate today" },
          ];
    content = !lesson ? (
      <MissingContent />
    ) : view.endsWith("/complete") ? (
      <>
        <Heading
          eyebrow={`DAY ${day} / SAVED`}
          title={
            saved?.completed
              ? "You have something to build on."
              : "Return to your practice."
          }
          description={
            saved?.completed
              ? "Your reflection and next step are saved. Give the action a place in your day."
              : "Complete the lesson to record this step in your journey."
          }
        />
        <div className="panel">
          {fields
            .filter((f) => saved?.answers[f.id])
            .map((f) => (
              <div key={f.id}>
                <p className="eyebrow">{f.label}</p>
                <p className="preserve-lines">{saved?.answers[f.id]}</p>
              </div>
            ))}
        </div>
        <div className="actions">
          <ButtonLink href={href(`lesson/${day}`)} className="button quiet">
            Revisit this lesson
          </ButtonLink>
          <ButtonLink href={href(day < 30 ? `lesson/${day + 1}` : "review")}>
            {day < 30
              ? `Next: ${outline[day].title}`
              : "Review your thirty days"}
          </ButtonLink>
        </div>
        {day < 30 && (
          <p className="muted">What follows: {outline[day].inner}</p>
        )}
      </>
    ) : (
      <>
        <ButtonLink href={href("course")} className="text-link back-link">
          All thirty lessons
        </ButtonLink>
        <Heading
          eyebrow={`DAY ${String(day).padStart(2, "0")} / PROSPERITY 30`}
          title={body!.title}
          description={body!.summary}
        />
        <div className="lesson-layout">
          <article className="teaching">
            {day === 1 && (
              <>
                <p className="story-lead">
                  Jordan has saved another video about starting a business. He
                  knows what other people are building. Today, he is going to
                  put his own direction into words.
                </p>
                <p className="micro">Jordan is a fictional teaching example.</p>
              </>
            )}
            {body!.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="teaching-anchor">
              <p className="eyebrow">YOUR MORNING ANCHOR</p>
              <blockquote>{body!.am}</blockquote>
            </div>
            <h2>Put the teaching into practice.</h2>
            <ol className="practice-steps">
              {body!.steps.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
            <div className="panel">
              <p className="eyebrow">BRING IT INTO YOUR LIFE</p>
              <p>{body!.action}</p>
              <p className="eyebrow">YOUR EVENING ANCHOR</p>
              <p>{body!.pm}</p>
            </div>
            <LessonGuide
              lesson={lesson}
              day={day}
              notes={snapshot.notes.filter((n) =>
                n.key.startsWith(`guide/${day}/`),
              )}
            />
            <Sources item={lesson} />
            <Cycle />
          </article>
          <aside className="exercise-panel">
            <SavedForm
              record={
                saved
                  ? { key: `lesson/${day}`, values: saved.answers, ...saved }
                  : null
              }
              fields={fields}
              onSave={async (values, expectedRevision, complete) => {
                const r = await saveLesson({
                  day,
                  answers: values,
                  completed: complete,
                  expectedRevision,
                });
                return { key: `lesson/${day}`, values: r.answers, ...r };
              }}
              onComplete={() => router.push(href(`lesson/${day}/complete`))}
            >
              <h2>
                Your work.
                <br />
                Your direction.
              </h2>
            </SavedForm>
          </aside>
        </div>
      </>
    );
  } else if (view === "tools")
    content = (
      <>
        <Heading
          eyebrow="YOUR INNER WORK TOOLKIT"
          title="Meet the moment in front of you."
          description="Choose a practice for the hesitation, opportunity or experience you are working with."
        />
        <div className="tools-grid">
          {library
            .filter((c) => c.key.startsWith("tool/"))
            .map((t) => (
              <ButtonLink
                key={t.key}
                href={href(t.key)}
                className="panel tool-card"
              >
                <p className="eyebrow">
                  {note(t.key) ? "YOUR NOTES ARE SAVED" : "GUIDED PRACTICE"}
                </p>
                <h2>{t.body.title}</h2>
                <p>{t.body.summary}</p>
                <span className="text-link">Open this practice ↗</span>
              </ButtonLink>
            ))}
        </div>
      </>
    );
  else if (view.startsWith("tool/")) {
    const tool = item(view);
    content = !tool ? (
      <MissingContent />
    ) : (
      <>
        <ButtonLink href={href("tools")} className="text-link">
          All inner work tools
        </ButtonLink>
        <Heading
          eyebrow="A PRACTICE FOR YOUR LIFE"
          title={tool.body.title}
          description={tool.body.summary}
        />
        <div className="tool-layout">
          <aside className="tool-instructions">
            <ol className="practice-steps">
              {tool.body.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <Sources item={tool} />
          </aside>
          <section className="panel">
            {noteForm(view, tool.body.fields)}
          </section>
        </div>
      </>
    );
  } else if (view === "profile") {
    const profile = item("profile");
    content = (
      <>
        <Heading
          eyebrow="PROSPERITY SELF-IMAGE MAP"
          title="Notice the person you bring to the plan."
          description="Reflect on one money or business ambition. Keep each domain separate. Skipping an answer is different from choosing zero."
        />
        <section className="panel">
          {noteForm(
            "profile",
            (profile?.body.fields ?? []).map((f) => ({
              ...f,
              label: `${profileDomains.find(([id]) => f.id.startsWith(id))?.[1]} — ${f.label}`,
              type: "rating",
            })),
          )}
        </section>
      </>
    );
  } else if (view === "ledger" || view === "review")
    content = (
      <Ledger
        weekly={view === "review"}
        notes={snapshot.notes}
        completed={completed}
      />
    );
  else if (isBookChapter(view) || isBookWorksheet(view)) {
    const entry = item(view);
    const chapter = isBookChapter(view);
    const number = Number(view.split("/").at(-1));
    content = !entry ? (
      <MissingContent />
    ) : (
      <>
        <Heading
          eyebrow={
            chapter
              ? `THE WEALTH PRIMER / CHAPTER ${number}`
              : `MY WORKBOOK / PAGE ${number}`
          }
          title={entry.body.title}
          description={entry.body.summary}
        />
        <div className="actions">
          <ButtonLink
            className="button quiet"
            href={href(chapter ? "book" : "book/workbook")}
          >
            {chapter ? "All chapters" : "All worksheets"}
          </ButtonLink>
          <ButtonLink
            className="text-link"
            href={href(chapter ? "book/workbook" : "book")}
          >
            {chapter ? "Open my workbook" : "Return to the book"}
          </ButtonLink>
        </div>
        <article className="book-reading">
          {entry.body.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {chapter ? (
            <>
              <section className="panel">
                <h2>Make it your own</h2>
                <ol>
                  {entry.body.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <h3>Carry it forward</h3>
                <p>{entry.body.reflection}</p>
              </section>
              <div className="actions">
                {number > 1 && (
                  <ButtonLink
                    className="button quiet"
                    href={href(`book/chapter/${number - 1}`)}
                  >
                    Previous chapter
                  </ButtonLink>
                )}
                <ButtonLink
                  href={href(
                    number < 8 ? `book/chapter/${number + 1}` : "book/workbook",
                  )}
                >
                  {number < 8 ? "Next chapter →" : "Return to my practice →"}
                </ButtonLink>
              </div>
            </>
          ) : (
            <section className="panel">
              {noteForm(
                view,
                entry.body.fields.map((field) => ({
                  ...field,
                  ...(number === 3 ? { type: "rating" as const } : {}),
                })),
              )}
            </section>
          )}
          <Sources item={entry} />
        </article>
      </>
    );
  } else if (view === "book" || view === "book/workbook") {
    const b = item("book");
    const chapters = library
      .filter((c) => isBookChapter(c.key))
      .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
    const worksheets = library
      .filter((c) => isBookWorksheet(c.key))
      .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
    const downloads = library.filter((c) => isBookDownload(c.key));
    content = !b ? (
      <MissingContent />
    ) : (
      <>
        <Heading
          eyebrow="THE INTENTFIELD WEALTH PRIMER"
          title={
            view === "book"
              ? "The inner work of building wealth."
              : "Give your ambition a direction."
          }
          description={
            view === "book"
              ? b.body.summary
              : "Choose a page for the situation in front of you. Save your answers privately and return whenever you need."
          }
        />
        <div className="actions">
          <ButtonLink
            href={href(view === "book" ? "book/workbook" : "book")}
            className="button quiet"
          >
            {view === "book" ? "Open my workbook" : "Return to the book"}
          </ButtonLink>
          <Media item={b} />
          {downloads.map((download) => (
            <Media key={download.key} item={download} />
          ))}
          <a
            className="text-link"
            href="/downloads/intentfield-book-workbook-sample.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Download opening sample PDF ↓
          </a>
        </div>
        {(view === "book" ? chapters : worksheets).length > 0 && (
          <section className="book-contents">
            <h2>
              {view === "book"
                ? "Your seven-day journey"
                : "Your reusable practice pages"}
            </h2>
            <div className="lesson-list">
              {(view === "book" ? chapters : worksheets).map((entry) => (
                <ButtonLink
                  key={entry.key}
                  className="lesson-row"
                  href={href(entry.key)}
                >
                  <span className="lesson-day">
                    {entry.key.split("/").at(-1)?.padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{entry.body.title}</h3>
                    <p>{entry.body.summary}</p>
                  </div>
                  <span className="lesson-status">
                    {view === "book"
                      ? "READ"
                      : note(entry.key)
                        ? "REVISIT"
                        : "OPEN"}
                  </span>
                </ButtonLink>
              ))}
            </div>
          </section>
        )}
        {view === "book" ? (
          <article className="book-reading">
            {b.body.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {chapters.length === 0 && (
              <section className="panel">
                <p className="eyebrow">A FICTIONAL WORKED EXAMPLE</p>
                <h2>{book.example.name}</h2>
                <p>{book.example.context}</p>
                {book.fields.map((f) => (
                  <div key={f.id}>
                    <h3>{f.label}</h3>
                    <p>{book.example[f.id as keyof typeof book.example]}</p>
                  </div>
                ))}
              </section>
            )}
            <Sources item={b} />
            <ButtonLink href={href("book/workbook")}>
              Make it your own
            </ButtonLink>
          </article>
        ) : (
          <div className="workbook-layout">
            <section className="panel">
              {noteForm("workbook", [
                ...b.body.fields,
                ...b.body.steps.map((label, i) => ({
                  id: `check${i}`,
                  label,
                  type: "check" as const,
                })),
              ])}
            </section>
            <aside className="panel">
              <h2>Your first direction.</h2>
              <p>
                Let the larger ambition remain expansive. Give today’s step a
                size you can act on.
              </p>
              {access.course && (
                <WorkbookTransfer workbook={note("workbook")} lesson={first} />
              )}
            </aside>
          </div>
        )}
      </>
    );
  } else if (view.startsWith("audio")) {
    const selected = item(view);
    content = (
      <>
        <Heading
          eyebrow="MORNING & EVENING / YOUR COMPANION"
          title={
            selected ? selected.body.title : "A rhythm for your inner work."
          }
          description="Bring appreciation, desire, imagination and reflection into your day."
        />
        {selected ? (
          <>
            <ButtonLink className="text-link" href={href("audio")}>
              All audio practices
            </ButtonLink>
            <Media item={selected} />
            <article className="audio-script panel">
              {selected.body.paragraphs.map((p, i) =>
                p.startsWith("[Pause") ? (
                  <p className="pause-direction" key={i}>
                    {p}
                  </p>
                ) : (
                  <p key={i}>{p}</p>
                ),
              )}
            </article>
          </>
        ) : (
          <div className="audio-library">
            {["morning", "evening"].map((m) => {
              const c = item(`audio/${m}`);
              return (
                <article className={`audio-card ${m}`} key={m}>
                  <span className="audio-symbol">
                    {m === "morning" ? "☀" : "☾"}
                  </span>
                  <p className="eyebrow">{m}</p>
                  <h2>{c?.body.title}</h2>
                  <p>
                    {m === "morning"
                      ? "Appreciation, desire, alignment, imagination and one next step."
                      : "Reflection, receiving, gratitude and room to rest."}
                  </p>
                  <ButtonLink
                    href={href(`audio/${m}`)}
                    className="button quiet"
                  >
                    {c?.storageId
                      ? "Open the audio practice"
                      : "Read the pilot script"}
                  </ButtonLink>
                  <span className="micro">
                    {c?.storageId
                      ? "RECORDING AVAILABLE"
                      : "SCRIPT READY / RECORDING TO COME"}
                  </span>
                </article>
              );
            })}
          </div>
        )}
      </>
    );
  } else if (view === "purchases")
    content = (
      <>
        <Heading
          eyebrow="YOUR INTENTFIELD LIBRARY"
          title={
            <>
              My products.
              <br />
              <span className="warm-emphasis">One connected practice.</span>
            </>
          }
          description="Open the products available to your account."
        />
        <ProductLibrary
          base={base}
          access={access}
          bookPublished={Boolean(item("book")?.storageId)}
          recordingCount={
            ["audio/morning", "audio/evening"].filter(
              (key) => item(key)?.storageId,
            ).length
          }
          nextLesson={next}
          completed={completed}
        />
        <p className="micro">
          This page shows access, not a payment receipt. Whop will manage
          purchases on both platforms.
        </p>
      </>
    );
  else if (view === "settings")
    content = <Settings settings={note("settings")} />;
  else if (view === "admin")
    content = access.owner ? (
      <ContentStudio />
    ) : (
      <Heading
        eyebrow="OWNER AREA"
        title="This page is for the content owner."
      />
    );
  else content = <MissingContent />;
  return (
    <MemberShell
      base={base}
      active={active}
      title={
        active === "today"
          ? "Today"
          : active === "purchases"
            ? "My products"
            : active.replace(/^./, (c) => c.toUpperCase())
      }
      accountMenu={accountMenu}
      owner={access.owner}
    >
      {content}
    </MemberShell>
  );
}
function MissingContent() {
  return (
    <Heading
      eyebrow="YOUR CONTENT LIBRARY"
      title="This practice is being prepared."
      description="Return to your workspace to continue with another practice."
    />
  );
}
const ledgerFields: Field[] = [
  {
    id: "experience",
    label: "What did I do, and what happened?",
    required: true,
  },
  { id: "received", label: "What did I receive or appreciate?" },
  { id: "meaning", label: "What did this mean to me?" },
  { id: "next", label: "What will I carry forward?" },
];
function Ledger({
  weekly,
  notes,
  completed,
}: {
  weekly: boolean;
  notes: Note[];
  completed: number;
}) {
  const save = useMutation(api.workspace.saveNote);
  const add = useMutation(api.workspace.addReflection);
  const [entryId, setEntryId] = useState(() => crypto.randomUUID());
  const key = `draft/${weekly ? "weekly" : "daily"}`;
  const draft = notes.find((n) => n.key === key) ?? null;
  const entries = notes
    .filter((n) => n.key.startsWith("ledger/"))
    .sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <>
      <Heading
        eyebrow={
          weekly ? "PAUSE / RECEIVE / CONTINUE" : "RECEIVE / RECORD / LEARN"
        }
        title={
          weekly
            ? "What is changing as you practice?"
            : "Give your experience a place to land."
        }
        description={
          weekly
            ? "Review your experience on Days 7, 14, 21 and 30, or whenever it helps."
            : "Record the action, what arrived, what it means to you and your next response."
        }
      />
      {weekly && (
        <div className="review-stats">
          <div>
            <strong>
              {completed}
              <small>/30</small>
            </strong>
            <span>Lessons completed</span>
          </div>
          <div>
            <strong>{entries.length}</strong>
            <span>Saved reflections</span>
          </div>
          <div>
            <strong>
              {
                notes.filter(
                  (n) =>
                    n.key.startsWith("tool/") &&
                    Object.values(n.values).some(Boolean),
                ).length
              }
            </strong>
            <span>Tools with your notes</span>
          </div>
        </div>
      )}
      <div className="ledger-layout">
        <section className="panel">
          <SavedForm
            key={entryId}
            record={draft}
            fields={ledgerFields}
            onSave={async (values, expectedRevision, complete) => {
              if (!complete) return save({ key, values, expectedRevision });
              await add({
                entryId,
                kind: weekly ? "weekly" : "daily",
                values,
                expectedRevision,
              });
              return {
                key,
                values: {},
                revision: expectedRevision + 1,
                completed: false,
                updatedAt: Date.now(),
              };
            }}
            onComplete={() => setEntryId(crypto.randomUUID())}
            saveLabel="Save reflection draft"
            completeLabel={
              weekly ? "Save my weekly review" : "Save my reflection"
            }
          />
        </section>
        <section className="ledger-entries">
          <p className="eyebrow">YOUR SAVED REFLECTIONS</p>
          {entries.length ? (
            entries.map((n) => (
              <article className="panel" key={n.key}>
                <p className="micro">
                  {new Date(n.updatedAt).toLocaleDateString()} /{" "}
                  {n.values.kind === "weekly" ? "WEEKLY REVIEW" : "REFLECTION"}
                </p>
                {ledgerFields
                  .filter((f) => n.values[f.id])
                  .map((f) => (
                    <div key={f.id}>
                      <h3>{f.label}</h3>
                      <p className="preserve-lines">{n.values[f.id]}</p>
                    </div>
                  ))}
              </article>
            ))
          ) : (
            <div className="empty-state">
              <span>↗</span>
              <h3>Your experience belongs here.</h3>
              <p>
                The first entry begins with something you tried and what
                happened next.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
function WorkbookTransfer({
  workbook,
  lesson,
}: {
  workbook: Note | null;
  lesson?: Lesson;
}) {
  const save = useMutation(api.workspace.saveLesson);
  const [message, setMessage] = useState("");
  return (
    <>
      <p>
        Carry your saved workbook into Day 1 when you are ready. Existing lesson
        answers will be replaced only after you confirm.
      </p>
      <button
        className="button quiet"
        disabled={!workbook}
        onClick={async () => {
          if (
            lesson &&
            !window.confirm(
              "Replace the Day 1 answers with your saved workbook?",
            )
          )
            return;
          try {
            const answers = Object.fromEntries(
              book.fields.map((f) => [f.id, workbook?.values[f.id] ?? ""]),
            );
            await save({
              day: 1,
              answers: { ...answers, appreciation: "" },
              completed: false,
              expectedRevision: lesson?.revision ?? 0,
            });
            setMessage("Your saved workbook is now in Day 1.");
          } catch (e) {
            setMessage(
              e instanceof Error ? e.message : "Could not copy your workbook.",
            );
          }
        }}
      >
        Copy saved workbook to Day 1
      </button>
      <p role="status">{message}</p>
      <ButtonLink className="text-link" href="/app/lesson/1">
        Open Day 1
      </ButtonLink>
    </>
  );
}
function Settings({ settings }: { settings: Note | null }) {
  const save = useMutation(api.workspace.saveNote);
  const clear = useMutation(api.workspace.clearMyNotes);
  const convex = useConvex();
  const dialog = useRef<HTMLDialogElement>(null);
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [reset, setReset] = useState(0);
  return (
    <>
      <Heading
        eyebrow="YOUR WORK / YOUR CHOICES"
        title="Keep your notes within reach."
      />
      <div className="settings-grid">
        <section className="panel">
          <SavedForm
            key={reset}
            record={settings}
            fields={[
              { id: "name", label: "What should we call you?", type: "name" },
            ]}
            onSave={(values, expectedRevision) =>
              save({ key: "settings", values, expectedRevision })
            }
            saveLabel="Save name"
          />
        </section>
        <section className="panel">
          <h2>Your notes belong to you.</h2>
          <p>
            Your work is saved privately to your account. Export your workbook,
            lessons, tool notes and reflections.
          </p>
          <button
            className="button quiet"
            onClick={async () => {
              try {
                const data = await convex.query(
                  api.workspace.exportMyNotes,
                  {},
                );
                const url = URL.createObjectURL(
                  new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                  }),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = "intentfield-my-notes.json";
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                setMessage("Your notes were exported.");
              } catch {
                setMessage("Export failed. Please try again.");
              }
            }}
          >
            Export my notes ↓
          </button>
          <hr />
          <button
            className="text-link"
            onClick={() => dialog.current?.showModal()}
          >
            Clear my workspace notes
          </button>
          <p className="micro">This keeps your account and product access.</p>
          <p role="status">{message}</p>
        </section>
      </div>
      <dialog ref={dialog}>
        <h2>Start with a clean page?</h2>
        <p>
          This permanently removes your lesson answers, completion, workbook,
          tool notes, guide reflections, ledger and saved name. Export a copy
          first.
        </p>
        <label className="field">
          <span>Type CLEAR MY NOTES to confirm</span>
          <input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
        </label>
        <div className="actions">
          <button
            className="button quiet"
            onClick={() => dialog.current?.close()}
          >
            Keep my notes
          </button>
          <button
            className="button primary"
            disabled={confirmation !== "CLEAR MY NOTES"}
            onClick={async () => {
              try {
                await clear({ confirmation: "CLEAR MY NOTES" });
                dialog.current?.close();
                setConfirmation("");
                setReset((n) => n + 1);
                setMessage(
                  "Your notes were cleared. Your products are still available.",
                );
              } catch {
                setMessage("Could not clear your notes. Please try again.");
              }
            }}
          >
            Clear my notes
          </button>
        </div>
      </dialog>
    </>
  );
}
