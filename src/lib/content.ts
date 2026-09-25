export type Product = "book" | "course" | "audio";
export const isBookChapter = (key: string) =>
  /^book\/chapter\/[1-8]$/.test(key);
export const isBookWorksheet = (key: string) =>
  /^book\/worksheet\/([1-9]|1\d|2[0-3])$/.test(key);
export const isBookDownload = (key: string) =>
  /^book\/download\/(workbook|checklist)$/.test(key);
export type ContentBody = {
  title: string;
  summary: string;
  paragraphs: string[];
  steps: string[];
  action: string;
  reflection: string;
  am: string;
  pm: string;
  sources: string[];
  fields: { id: string; label: string; placeholder: string }[];
};
export type ContentItem = {
  key: string;
  sku: Product;
  body: ContentBody;
  revision: number;
  storageId?: string;
  fileName?: string;
};
export type Note = {
  key: string;
  values: Record<string, string>;
  revision: number;
  completed: boolean;
  updatedAt: number;
};
export const emptyBody = (): ContentBody => ({
  title: "",
  summary: "",
  paragraphs: [],
  steps: [],
  action: "",
  reflection: "",
  am: "",
  pm: "",
  sources: [],
  fields: [],
});
export const toolIds = [
  "desire",
  "counter",
  "habit",
  "dream",
  "focus",
  "support",
  "mastery",
  "evidence",
];
export const profileDomains = [
  ["money_identity", "Money self-image"],
  ["learn_change", "Learning and change"],
  ["alignment", "Emotional alignment"],
  ["conviction", "Desire and conviction"],
  ["execution", "Aligned execution"],
  ["receiving", "Receiving and stewardship"],
];
export function validView(view: string) {
  return (
    [
      "today",
      "course",
      "tools",
      "profile",
      "review",
      "ledger",
      "settings",
      "book",
      "book/workbook",
      "audio",
      "audio/morning",
      "audio/evening",
      "purchases",
      "admin",
    ].includes(view) ||
    isBookChapter(view) ||
    isBookWorksheet(view) ||
    /^lesson\/([1-9]|[12]\d|30)(\/complete)?$/.test(view) ||
    toolIds.some((id) => view === `tool/${id}`)
  );
}
