"use client";
import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { ContentItem, Note } from "@/lib/content";
export function LessonGuide({
  lesson,
  day,
  notes,
}: {
  lesson: ContentItem;
  day: number;
  notes: Note[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const save = useMutation(api.workspace.saveNote);
  const questions =
    mode === "reflect"
      ? [
          "What do you want this ambition to make possible in an ordinary day?",
          "What hesitation or competing concern comes up when you picture that life?",
          "What is one choice that respects your ambition and that concern?",
        ]
      : [
          "What is one action or conversation connected to your ambition?",
          "What opening sentence or first movement could you rehearse?",
          "When will you try it, and what do you want to learn?",
        ];
  return (
    <section className="panel">
      <p className="eyebrow">OPTIONAL GUIDANCE</p>
      <h3>Bring the teaching into your life.</h3>
      <p>Understand the idea, reflect on a hesitation or rehearse one step.</p>
      <button
        className="button quiet"
        onClick={() => {
          setMode("");
          setAnswers({});
          setReview(false);
          setMessage("");
          dialog.current?.showModal();
        }}
      >
        Open the lesson guide ↗
      </button>
      {notes.map((n) => (
        <details key={n.key}>
          <summary>
            My saved {n.values.mode === "reflect" ? "reflection" : "rehearsal"}
          </summary>
          {[0, 1, 2].map((i) => (
            <p className="preserve-lines" key={i}>
              {n.values[`answer${i}`]}
            </p>
          ))}
        </details>
      ))}
      <dialog ref={dialog} className="guide-dialog">
        <div className="dialog-head">
          <div>
            <p className="eyebrow">YOUR LESSON GUIDE</p>
            <h2>Make the practice your own.</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close guide"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <p className="guide-disclosure">
          Guided prompts based on this lesson. This is a scripted practice, not
          a live AI conversation. Only words you choose to save are stored.
        </p>
        <div className="guide-context">
          <span>DAY {day}</span>
          <strong>{lesson.body.title}</strong>
        </div>
        {!mode ? (
          <div className="guide-options">
            {[
              [
                "explain",
                "Explain this",
                "Understand the idea in everyday language.",
              ],
              [
                "reflect",
                "Help me reflect",
                "Work through a few questions of your own.",
              ],
              [
                "rehearse",
                "Practice with me",
                "Give one next step a sentence and a setting.",
              ],
            ].map(([id, title, desc]) => (
              <button key={id} onClick={() => setMode(id)}>
                <b>{title}</b>
                <span>{desc}</span>↗
              </button>
            ))}
          </div>
        ) : mode === "explain" ? (
          <>
            <div className="chat-message guide">
              <p>{lesson.body.summary}</p>
              <p>{lesson.body.steps[0]}</p>
              <p>
                Imagination and feeling help you become familiar with the life
                you want to experience. Your next action gives the practice an
                expression today.
              </p>
              <span className="micro">
                Based on the current lesson: {lesson.body.sources.join("; ")}.
              </span>
            </div>
            <button className="button quiet" onClick={() => setMode("")}>
              Choose another kind of help
            </button>
          </>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!review) {
                setReview(true);
                return;
              }
              setBusy(true);
              try {
                await save({
                  key: `guide/${day}/${crypto.randomUUID()}`,
                  values: {
                    mode,
                    ...Object.fromEntries(
                      [0, 1, 2].map((i) => [`answer${i}`, answers[i] ?? ""]),
                    ),
                  },
                  expectedRevision: 0,
                });
                dialog.current?.close();
              } catch (err) {
                setMessage(
                  err instanceof Error
                    ? err.message
                    : "Could not save. Try again.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            {questions.map((q, i) => (
              <label className="field" key={q}>
                <span>{q}</span>
                {review ? (
                  <p className="preserve-lines">{answers[i]}</p>
                ) : (
                  <textarea
                    rows={3}
                    required
                    maxLength={6000}
                    value={answers[i] ?? ""}
                    onChange={(e) =>
                      setAnswers({ ...answers, [i]: e.target.value })
                    }
                  />
                )}
              </label>
            ))}
            <button className="button primary" disabled={busy}>
              {busy
                ? "Saving…"
                : review
                  ? "Save this reflection to my lesson"
                  : "Review my reflection"}
            </button>
            {review && (
              <button
                className="text-link"
                type="button"
                onClick={() => setReview(false)}
              >
                Edit my words
              </button>
            )}
            <button
              className="decline"
              type="button"
              onClick={() => dialog.current?.close()}
            >
              Return without saving
            </button>
            <p role="status">{message}</p>
          </form>
        )}
      </dialog>
    </section>
  );
}
