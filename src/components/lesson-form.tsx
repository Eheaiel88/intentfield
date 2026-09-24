"use client";
import { useState, useEffect } from "react";
import type { Answers, LessonRecord } from "@/lib/lesson";
import { answerKeys, blankAnswers, completionError } from "@/lib/lesson";
import book from "@/lib/book-sample.json";
import { Arrow, ButtonLink } from "./brand";
export type SaveLesson = (
  answers: Answers,
  completed: boolean,
  expectedRevision: number,
) => Promise<LessonRecord>;
export function LessonForm({
  record,
  onSave,
  base,
  review = false,
}: {
  record: LessonRecord | null;
  onSave: SaveLesson;
  base: string;
  review?: boolean;
}) {
  const [answers, setAnswers] = useState<Answers>(
    () => record?.answers ?? blankAnswers(),
  );
  const [saved, setSaved] = useState(record);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  // Convex may serialize keys in a different order. Compare field values so a
  // confirmed cloud save does not appear unsaved merely because of key order.
  const dirty = answerKeys.some(
    (key) => answers[key] !== (saved?.answers[key] ?? ""),
  );
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function save(complete: boolean) {
    if (busy) return;
    setError(false);
    setMessage("");
    const invalid = complete ? completionError(answers) : null;
    if (invalid) {
      setError(true);
      setMessage(invalid);
      return;
    }
    setBusy(true);
    try {
      const result = await onSave(answers, complete, saved?.revision ?? 0);
      setSaved(result);
      setMessage(
        complete
          ? "Day 1 completed. Your direction and next step are saved."
          : review
            ? "Draft saved in this browser."
            : "Draft saved to your private workspace.",
      );
    } catch (e) {
      setError(true);
      setMessage(
        e instanceof Error
          ? e.message
          : "Saving failed. Your words are still here; try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save(true);
        }}
      >
        <div className="exercise-header">
          <h2>
            Your work.
            <br />
            Your direction.
          </h2>
          <span className="micro">
            Save your draft before leaving.
            <br />* Required to complete
          </span>
        </div>
        <p className="eyebrow">01 / MAKE ROOM FOR THE WHOLE VISION</p>
        {book.fields.map((f, i) => (
          <div key={f.id}>
            {i === 3 && (
              <p className="eyebrow form-section">02 / CHOOSE YOUR DIRECTION</p>
            )}
            {i === 6 && (
              <>
                <p className="eyebrow form-section">
                  03 / BRING IT INTO YOUR LIFE
                </p>
                <p>
                  Choose one direction to explore alongside your current
                  responsibilities.
                </p>
              </>
            )}
            <label className="field" htmlFor={f.id}>
              <span>
                {f.label}
                {["focus", "action", "review"].includes(f.id) && (
                  <b aria-hidden="true"> *</b>
                )}
              </span>
              <textarea
                id={f.id}
                name={f.id}
                value={answers[f.id as keyof Answers]}
                rows={3}
                maxLength={6000}
                placeholder={f.placeholder}
                required={["focus", "action", "review"].includes(f.id)}
                onChange={(e) =>
                  setAnswers({ ...answers, [f.id]: e.target.value })
                }
              />
            </label>
          </div>
        ))}
        <label className="field" htmlFor="appreciation">
          <span>Something I appreciate today</span>
          <input
            id="appreciation"
            maxLength={1000}
            value={answers.appreciation}
            onChange={(e) =>
              setAnswers({ ...answers, appreciation: e.target.value })
            }
            placeholder="A real moment, person or possibility…"
          />
        </label>
        <div className="save-actions">
          <button
            type="button"
            className="button quiet"
            disabled={busy}
            onClick={() =>
              void save(saved?.completed === true && !completionError(answers))
            }
          >
            Save draft
          </button>
          <button type="submit" className="button primary" disabled={busy}>
            {busy
              ? "Saving…"
              : saved?.completed
                ? "Save completed lesson"
                : "Complete this lesson"}
            <Arrow />
          </button>
        </div>
        <p
          className={`form-status ${error ? "error-status" : dirty ? "form-unsaved" : ""}`}
          role="status"
          aria-live="polite"
        >
          {dirty && !busy && !error
            ? "You have unsaved changes."
            : message || (saved ? "Saved." : "Your answers begin here.")}
        </p>
      </form>
      {saved?.completed && !dirty && (
        <section className="next-connection">
          <p className="eyebrow">THE CONNECTION TO WHAT COMES NEXT</p>
          <h3>Meet your money self-image.</h3>
          <p>
            You have named the prosperity you want. Next, explore the self-image
            you bring to earning and receiving it.
          </p>
          <p className="micro">
            Day 2 is next in the curriculum. Its application screen is coming in
            the next build.
          </p>
          <ButtonLink href={`${base}/today`} className="text-link">
            Return to Today
          </ButtonLink>
        </section>
      )}
    </>
  );
}
