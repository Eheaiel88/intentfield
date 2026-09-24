// Public design-preview choices only. Never use these values as payment or access evidence.
export type PreviewSelection = { course: boolean; audio: boolean };
export type PreviewStep = "book" | "course" | "audio" | "complete";
export type PreviewQuery = Record<string, string | string[] | undefined>;

export function readPreviewSelection(query: PreviewQuery): PreviewSelection {
  return { course: query.course === "1", audio: query.audio === "1" };
}

export function previewTotal(selection: PreviewSelection) {
  return 19 + (selection.course ? 79 : 0) + (selection.audio ? 29 : 0);
}

export function previewHref(step: PreviewStep, selection: PreviewSelection) {
  if (step === "book") return "/checkout";
  return `/checkout/${step}?course=${selection.course ? "1" : "0"}&audio=${selection.audio ? "1" : "0"}`;
}
