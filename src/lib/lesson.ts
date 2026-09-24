export const answerKeys = [
  "stability",
  "experiences",
  "qualities",
  "focus",
  "meaning",
  "scene",
  "action",
  "review",
  "appreciation",
] as const;
export type Answers = Record<(typeof answerKeys)[number], string>;
export const blankAnswers = (): Answers => ({
  stability: "",
  experiences: "",
  qualities: "",
  focus: "",
  meaning: "",
  scene: "",
  action: "",
  review: "",
  appreciation: "",
});
export type LessonRecord = {
  answers: Answers;
  completed: boolean;
  revision: number;
  updatedAt: number;
};
export function completionError(answers: Answers) {
  return ["focus", "action", "review"].some(
    (k) => !answers[k as keyof Answers]?.trim(),
  )
    ? "Add your chief focus, next action and review plan before completing the lesson."
    : null;
}
