"use client";
import { MemberShell } from "./member-shell";
import { ButtonLink, Cycle } from "./brand";
import { LessonForm, type SaveLesson } from "./lesson-form";
import type { LessonRecord } from "@/lib/lesson";
import day from "@/lib/day-one.json";
import outline from "@/lib/course-outline.json";
export type WorkspaceView = "today" | "course" | "lesson/1";
export function Workspace({
  view,
  base,
  record,
  onSave,
  review = false,
  accountMenu,
}: {
  view: WorkspaceView;
  base: string;
  record: LessonRecord | null;
  onSave: SaveLesson;
  review?: boolean;
  accountMenu?: React.ReactNode;
}) {
  const completed = record?.completed;
  return (
    <MemberShell
      base={base}
      active={view === "today" ? "today" : "course"}
      title={
        view === "today" ? "Today" : view === "course" ? "The course" : "Day 01"
      }
      review={review}
      accountMenu={accountMenu}
    >
      {view === "today" ? (
        <>
          <div className="page-heading">
            <p className="eyebrow">YOUR NEXT CHAPTER</p>
            <h1>
              Build wealth.
              <br />
              <span>Start within.</span>
            </h1>
            <p>
              One direction. A daily practice. Your own experience to learn
              from.
            </p>
          </div>
          <div className="today-grid">
            <section className="today-main">
              <div className="card-top">
                <span className="pill">DAY 01 / 30</span>
                <span className="micro">10–15 MIN + YOUR ACTION</span>
              </div>
              <p className="eyebrow">
                {completed ? "YOUR FOUNDATION IS SAVED" : "TODAY’S LESSON"}
              </p>
              <h2>{day.title}.</h2>
              <p>{day.inner}</p>
              <ButtonLink href={`${base}/lesson/1`}>
                {completed
                  ? "Revisit my direction"
                  : record
                    ? "Continue today’s practice"
                    : "Begin today’s practice"}
              </ButtonLink>
              <div className="today-takeaway">
                <span>YOU’LL LEAVE WITH</span>
                <p>
                  One chief focus, the life it makes possible, and a first
                  useful step.
                </p>
              </div>
            </section>
            <aside className="direction-card">
              <p className="eyebrow">MY CHIEF PROSPERITY AIM</p>
              <span className="direction-mark">↗</span>
              <h3>
                {record?.answers.focus ||
                  "What do you want your work and money to make possible?"}
              </h3>
              <p>
                {record?.answers.meaning ||
                  "Give your attention a direction that belongs to you."}
              </p>
              <ButtonLink href={`${base}/lesson/1`} className="text-link">
                {record?.answers.focus
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
              <span className="micro">
                {completed ? 1 : 0} OF 30 LESSONS COMPLETED
              </span>
            </div>
            <Cycle />
            <p className="micro">
              These stages repeat within the daily work. Choose what helps with
              the situation in front of you.
            </p>
          </section>
          {completed && (
            <div className="panel">
              <p className="eyebrow">YOUR NEXT LESSON</p>
              <h3>Meet your money self-image.</h3>
              <p>
                You have a direction. The next lesson explores the self-image
                you bring to earning and receiving.
              </p>
              <ButtonLink href={`${base}/course`} className="text-link">
                See the course journey
              </ButtonLink>
            </div>
          )}
        </>
      ) : view === "course" ? (
        <>
          <div className="page-heading">
            <p className="eyebrow">PROSPERITY 30</p>
            <h1>
              Thirty days.
              <br />
              <span>One direction of your own.</span>
            </h1>
            <p>
              The V2.1 course journey. Day 1 is available in this first
              application build; the remaining lessons follow in the next
              milestone.
            </p>
          </div>
          <div className="course-intro">
            <Cycle />
            <p>
              Use the six-stage cycle throughout the month. A lesson introduces
              a focus; the tools help you work with your own situation.
            </p>
          </div>
          <div className="lesson-list">
            {outline.map((d) =>
              d.day === 1 ? (
                <ButtonLink
                  key={d.day}
                  href={`${base}/lesson/1`}
                  className="lesson-row"
                >
                  <span className={`lesson-day ${completed ? "complete" : ""}`}>
                    {completed ? "✓" : "01"}
                  </span>
                  <div>
                    <h3>{d.title}</h3>
                    <p>{d.inner}</p>
                  </div>
                  <span className="lesson-status">
                    {completed ? "COMPLETE" : "OPEN LESSON"}
                  </span>
                </ButtonLink>
              ) : (
                <div className="lesson-row pending" key={d.day}>
                  <span className="lesson-day">
                    {String(d.day).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{d.title}</h3>
                    <p>{d.inner}</p>
                  </div>
                  <span className="lesson-status">
                    COMING IN THE NEXT BUILD
                  </span>
                </div>
              ),
            )}
          </div>
        </>
      ) : (
        <>
          <ButtonLink href={`${base}/course`} className="text-link back-link">
            All thirty lessons
          </ButtonLink>
          <div className="lesson-heading">
            <div className="page-heading">
              <p className="eyebrow">DAY 01 / PROSPERITY 30</p>
              <h1>{day.title}.</h1>
              <p>{day.inner}</p>
            </div>
          </div>
          <div className="lesson-layout">
            <article className="teaching">
              <p className="reading-label">UNDERSTAND / YOUR FIRST DIRECTION</p>
              <p className="story-lead">
                Jordan has saved another video about starting a business. He
                knows what other people are building. Today, he is going to put
                his own direction into words.
              </p>
              <p className="micro">Jordan is a fictional teaching example.</p>
              {day.teaching.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <div className="teaching-anchor">
                <span className="eyebrow">YOUR MORNING ANCHOR</span>
                <blockquote>{day.am}</blockquote>
              </div>
              <h2>Put the teaching into practice.</h2>
              <ol className="practice-steps">
                {day.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <div className="source-note">
                <details>
                  <summary>Where this practice comes from</summary>
                  <p>
                    Original IntentField teaching, carried forward from V2.1.
                    Source locators: {day.sourceLocators.join("; ")}.
                  </p>
                  <p>
                    LM refers to the supplied The Lazy Man’s Way to Riches PDF.
                    Disc references refer to the reviewed Your Wish Is Your
                    Command materials. The exercise and application are
                    IntentField adaptations.
                  </p>
                </details>
              </div>
              <Cycle />
            </article>
            <aside className="exercise-panel">
              <LessonForm
                record={record}
                onSave={onSave}
                base={base}
                review={review}
              />
            </aside>
          </div>
        </>
      )}
    </MemberShell>
  );
}
