"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isBookDownload, isBookChapter, type ContentBody } from "@/lib/content";
import type { Id } from "../../convex/_generated/dataModel";
export function ContentStudio() {
  const items = useQuery(api.content.ownerList, {});
  const [selected, setSelected] = useState("lesson/1");
  const [dirty, setDirty] = useState(false);
  if (!items) return <p>Opening your content studio…</p>;
  const item = items.find((i) => i.key === selected);
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">OWNER / CONTENT STUDIO</p>
        <h1>Shape the journey.</h1>
        <p>
          Edit a draft, review it, then publish when it is ready. Your members
          keep their own notes when teaching changes.
        </p>
      </div>
      <label className="field">
        <span>Choose content to edit</span>
        <select
          value={selected}
          onChange={(e) => {
            if (
              dirty &&
              !window.confirm("Discard the unsaved content changes?")
            )
              return;
            setDirty(false);
            setSelected(e.target.value);
          }}
        >
          {[...items]
            .sort((a, b) =>
              a.key.localeCompare(b.key, undefined, { numeric: true }),
            )
            .map((i) => (
              <option key={i.key} value={i.key}>
                {i.key} — {i.body.title}
                {i.draft ? " · DRAFT" : ""}
              </option>
            ))}
        </select>
      </label>
      {item && (
        <ContentEditor
          key={item.key + ":" + item.revision}
          item={item}
          onDirty={setDirty}
        />
      )}
    </>
  );
}
type Item = {
  key: string;
  body: ContentBody;
  draft?: ContentBody;
  revision: number;
  fileName?: string;
};
function ContentEditor({
  item,
  onDirty,
}: {
  item: Item;
  onDirty: (dirty: boolean) => void;
}) {
  const [body, setBody] = useState(item.draft ?? item.body);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const draft = useMutation(api.content.saveDraft);
  const publish = useMutation(api.content.publish);
  const getUploadUrl = useMutation(api.content.uploadUrl);
  const attach = useMutation(api.content.attachMedia);
  const remove = useMutation(api.content.removeMedia);
  const dirty =
    JSON.stringify(body) !== JSON.stringify(item.draft ?? item.body);
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => {
    onDirty(dirty);
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const navigate = (e: MouseEvent) => {
      if (
        (e.target as Element).closest("a[href]") &&
        !window.confirm("Discard the unsaved content changes?")
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
  }, [dirty, onDirty]);
  async function perform(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      setMessage(success);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "The update failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  function text(
    key: "title" | "summary" | "action" | "reflection" | "am" | "pm",
    label: string,
  ) {
    return (
      <label className="field" key={key}>
        <span id={`content-label-${key}`}>{label}</span>
        <textarea
          aria-labelledby={`content-label-${key}`}
          rows={key === "title" ? 2 : 3}
          value={body[key]}
          onChange={(e) => setBody({ ...body, [key]: e.target.value })}
        />
      </label>
    );
  }
  function paragraphs(key: "paragraphs" | "steps" | "sources", label: string) {
    return (
      <label className="field" key={key}>
        <span>{label} — separate each item with a blank line</span>
        <textarea
          rows={key === "paragraphs" ? 16 : 5}
          value={body[key].join("\n\n")}
          onChange={(e) =>
            setBody({ ...body, [key]: e.target.value.split(/\n\n/) })
          }
        />
      </label>
    );
  }
  return (
    <div className="content-editor">
      <section className="panel">
        <p className="eyebrow">
          {item.draft ? "SAVED DRAFT / NOT PUBLISHED" : "PUBLISHED CONTENT"} ·
          REVISION {item.revision}
        </p>
        {text("title", "Title")}
        {text("summary", "Introduction")}
        {paragraphs(
          "paragraphs",
          item.key.startsWith("audio/") ? "Audio script" : "Teaching",
        )}
        {!item.key.startsWith("audio/") &&
          paragraphs("steps", "Practice steps")}
        {(item.key.startsWith("lesson/") || isBookChapter(item.key)) && (
          <>
            {text("action", "Action in the world")}
            {text("reflection", "Reflection prompt")}
            {text("am", "Morning anchor")}
            {text("pm", "Evening anchor")}
          </>
        )}
        {paragraphs("sources", "Source notes")}
        <div className="actions">
          <button
            className="button quiet"
            disabled={busy || !dirty}
            onClick={() =>
              void perform(
                () =>
                  draft({
                    key: item.key,
                    body,
                    expectedRevision: item.revision,
                  }),
                "Draft saved.",
              )
            }
          >
            Save draft
          </button>
          <button
            className="button primary"
            disabled={busy || dirty || !item.draft}
            onClick={() =>
              void perform(
                () =>
                  publish({ key: item.key, expectedRevision: item.revision }),
                "Published.",
              )
            }
          >
            Publish saved draft
          </button>
        </div>
        <p role="status">
          {message ||
            (dirty
              ? "Unsaved changes — save before changing the content selection."
              : item.draft
                ? "Your draft is saved. Publishing makes it visible to entitled members."
                : "Members see this published version.")}
        </p>
      </section>
      {(item.key === "book" ||
        isBookDownload(item.key) ||
        item.key.startsWith("audio/")) && (
        <section className="panel">
          <h2>
            {item.key.startsWith("book")
              ? "Published PDF"
              : "Finished audio recording"}
          </h2>
          <p>
            {item.fileName
              ? `Current file: ${item.fileName}`
              : "No production file published yet."}
          </p>
          {item.fileName && (
            <button
              className="text-link"
              onClick={() => {
                if (
                  window.confirm(
                    "Remove this published file from the member library?",
                  )
                )
                  void perform(
                    () =>
                      remove({
                        key: item.key,
                        expectedRevision: item.revision,
                      }),
                    "File removed from the library.",
                  );
              }}
            >
              Remove published file
            </button>
          )}
          <p>
            Uploading and publishing replaces the file members open. Keep the
            original locally. Maximum file size: 250 MB.
          </p>
          <label className="field">
            <span>
              {item.key.startsWith("book")
                ? "Choose a PDF"
                : "Choose an audio file"}
            </span>
            <input
              type="file"
              accept={
                item.key.startsWith("book") ? "application/pdf" : "audio/*"
              }
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            className="button primary"
            disabled={busy || !file || dirty}
            onClick={() =>
              void perform(async () => {
                if (!file) return;
                if (file.size > 250 * 1024 * 1024)
                  throw Error("Choose a file under 250 MB.");
                const url = await getUploadUrl();
                const response = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": file.type },
                  body: file,
                });
                if (!response.ok)
                  throw Error("Upload failed. Please try again.");
                const { storageId } = (await response.json()) as {
                  storageId: Id<"_storage">;
                };
                await attach({
                  key: item.key,
                  storageId,
                  fileName: file.name,
                  expectedRevision: item.revision,
                });
              }, "File published.")
            }
          >
            {busy ? "Uploading…" : "Upload and publish file"}
          </button>
        </section>
      )}
    </div>
  );
}
