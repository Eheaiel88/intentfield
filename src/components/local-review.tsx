"use client";
import { useEffect, useState } from "react";
import { Workspace, type WorkspaceView } from "./workspace";
import type { LessonRecord } from "@/lib/lesson";
import { answerKeys } from "@/lib/lesson";
const KEY = "intentfield-next-review-day1-v1";
export function LocalReview({ view }: { view: WorkspaceView }) {
  const [record, setRecord] = useState<LessonRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const value = JSON.parse(raw);
        if (
          !value ||
          !answerKeys.every((k) => typeof value.answers?.[k] === "string") ||
          typeof value.completed !== "boolean" ||
          !Number.isInteger(value.revision)
        )
          throw Error("Invalid saved draft");
        // Loading persisted external state after hydration keeps the server markup deterministic.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRecord(value);
      }
    } catch {
      setError(
        "Your local review draft could not be loaded. Saving will replace the unreadable draft.",
      );
    }
    setReady(true);
  }, []);
  if (!ready)
    return (
      <main id="main" className="member-loading">
        Opening the local review…
      </main>
    );
  return (
    <>
      {error && (
        <p role="alert" className="dev-bar">
          {error}
        </p>
      )}
      <Workspace
        key={view}
        view={view}
        base="/dev/review"
        record={record}
        review
        onSave={async (answers, completed, expectedRevision) => {
          const raw = localStorage.getItem(KEY);
          let latest = 0;
          try {
            const value = raw ? JSON.parse(raw) : null;
            latest =
              value &&
              answerKeys.every((k) => typeof value.answers?.[k] === "string") &&
              typeof value.completed === "boolean" &&
              Number.isInteger(value.revision)
                ? value.revision
                : 0;
          } catch {
            /* A malformed local draft can be replaced. */
          }
          if (latest !== expectedRevision)
            throw Error(
              "This local draft changed in another tab. Copy your words, then reload before saving.",
            );
          const next = {
            answers,
            completed,
            revision: expectedRevision + 1,
            updatedAt: Date.now(),
          };
          localStorage.setItem(KEY, JSON.stringify(next));
          setRecord(next);
          setError("");
          return next;
        }}
      />
    </>
  );
}
