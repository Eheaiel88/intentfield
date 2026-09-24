export type Product = "book" | "course" | "audio";
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
    /^lesson\/([1-9]|[12]\d|30)(\/complete)?$/.test(view) ||
    toolIds.some((id) => view === `tool/${id}`)
  );
}
