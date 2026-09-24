"use client";
import { useState, useEffect, useRef } from "react";
import type { Note } from "@/lib/content";
export type Field = {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: "rating" | "check" | "name";
};
export function SavedForm({
  record,
  fields,
  onSave,
  onComplete,
  children,
  saveLabel = "Save my notes",
  completeLabel = "Complete this lesson ↗",
}: {
  record: Note | null;
  fields: Field[];
  onSave: (
    values: Record<string, string>,
    revision: number,
    complete: boolean,
  ) => Promise<Note>;
  onComplete?: () => void;
  children?: React.ReactNode;
  saveLabel?: string;
  completeLabel?: string;
}) {
  const [values, setValues] = useState(record?.values ?? {});
  const [saved, setSaved] = useState(record);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const dirty = Object.keys({ ...values, ...saved?.values }).some(
    (k) => (values[k] ?? "") !== (saved?.values[k] ?? ""),
  );
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const navigate = (e: MouseEvent) => {
      const link = (e.target as Element).closest("a[href]");
      if (
        link &&
        !window.confirm(
          "Your latest changes have not saved yet. Leave this page?",
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", navigate, true);
    };
  }, [dirty]);
  async function save(complete = false) {
    if (busyRef.current) return;
    if (complete && fields.some((f) => f.required && !values[f.id]?.trim())) {
      setError(true);
      setMessage("Fill in the required fields before completing.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError(false);
    try {
      const next = await onSave(
        values,
        saved?.revision ?? 0,
        complete || saved?.completed === true,
      );
      setSaved(next);
      setMessage(
        complete
          ? "Lesson completed. Your work is saved."
          : "Saved to your private workspace.",
      );
      if (complete) onComplete?.();
    } catch (e) {
      setError(true);
      setMessage(
        e instanceof Error
          ? e.message
          : "Saving failed. Your words are still here; try again.",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  // Manual saving makes network failures and revisions explicit. Navigation is guarded while dirty.
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save(!!onComplete);
      }}
    >
      {children}
      <p className="micro">
        Save before leaving. {onComplete ? "* Required to complete" : ""}
      </p>
      {fields.map((f) => (
        <label
          className={`field ${f.type === "check" ? "check-field" : ""}`}
          key={f.id}
        >
          <span>
            {f.label}
            {f.required && " *"}
          </span>
          {f.type === "rating" ? (
            <select
              value={values[f.id] ?? ""}
              onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
            >
              <option value="">Skip / not answered</option>
              {Array.from({ length: 11 }, (_, n) => (
                <option key={n} value={n}>
                  {n} —{" "}
                  {n === 0
                    ? "Not true for me now"
                    : n === 10
                      ? "Consistently true"
                      : n === 5
                        ? "Partly true"
                        : n < 5
                          ? "Sometimes true"
                          : "Often true"}
                </option>
              ))}
            </select>
          ) : f.type === "check" ? (
            <input
              type="checkbox"
              checked={values[f.id] === "yes"}
              onChange={(e) =>
                setValues({ ...values, [f.id]: e.target.checked ? "yes" : "" })
              }
            />
          ) : f.type === "name" ? (
            <input
              value={values[f.id] ?? ""}
              maxLength={60}
              autoComplete="given-name"
              onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
            />
          ) : (
            <textarea
              rows={3}
              maxLength={6000}
              value={values[f.id] ?? ""}
              placeholder={f.placeholder}
              onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
            />
          )}
        </label>
      ))}
      <div className="actions">
        <button
          className="button quiet"
          type="button"
          disabled={busy}
          onClick={() => void save()}
        >
          {busy ? "Saving…" : saveLabel}
        </button>
        {onComplete && (
          <button className="button primary" type="submit" disabled={busy}>
            {completeLabel}
          </button>
        )}
      </div>
      <p
        className={error ? "form-error" : "micro"}
        role={error ? "alert" : "status"}
      >
        {message ||
          (dirty
            ? "Unsaved changes"
            : record
              ? "Your saved notes"
              : "Your private writing space")}
      </p>
    </form>
  );
}
