"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { AudioVoice, ContentItem } from "@/lib/content";

export function AudioPlayer({ item }: { item: ContentItem }) {
  const [preference, setPreference] = useState<AudioVoice | "original">("male");
  const voices = (["male", "female"] as const).filter((voice) =>
    item.audioVariants?.some((file) => file.voice === voice),
  );
  const available = [
    ...voices,
    ...(item.storageId ? ["original" as const] : []),
  ];
  const selected = available.includes(preference)
    ? preference
    : (available[0] ?? "male");
  const media = useQuery(api.content.media, {
    key: item.key,
    ...(selected !== "original" ? { voice: selected } : {}),
  });
  return (
    <section
      className="panel audio-player"
      aria-label="Listen to this practice"
    >
      <label className="field">
        <span>Narration voice</span>
        <select
          value={selected}
          disabled={available.length === 0}
          onChange={(e) => setPreference(e.target.value as typeof preference)}
        >
          <option value="male" disabled={!voices.includes("male")}>
            Male voice
          </option>
          <option value="female" disabled={!voices.includes("female")}>
            Female voice
          </option>
          {item.storageId && (
            <option value="original">Original recording</option>
          )}
        </select>
      </label>
      {media?.url ? (
        <>
          <audio
            key={`${item.key}:${selected}:${media.url}`}
            controls
            preload="metadata"
            src={media.url}
            aria-label={`${item.body.title} — ${selected} voice`}
          />
          <a
            className="text-link"
            href={media.url}
            download={media.fileName}
            target="_blank"
            rel="noreferrer"
          >
            Download this recording ↓
          </a>
          <p className="micro">
            Both voices are included. Switching voices stops the current
            recording; press play when you are ready.
          </p>
        </>
      ) : (
        <p role="status">
          {media === undefined
            ? "Opening the recording…"
            : "The written practice is ready below. Recordings will appear here when published."}
        </p>
      )}
    </section>
  );
}
