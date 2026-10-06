import type {
  AnswerValue,
  Chapter,
  ChoiceValue,
  FieldsValue,
  FilesValue,
  ListValue,
  Question,
  ToggleValue,
} from "@/content/types";

const filled = (s: unknown) => typeof s === "string" && s.trim().length > 0;

export function isAnswered(question: Question, value: AnswerValue | undefined): boolean {
  if (value == null) return false;
  switch (question.kind) {
    case "text":
      return filled(value);
    case "fields":
      return Object.values(value as FieldsValue).some(filled);
    case "list":
      return (value as ListValue).some((item) => Object.values(item).some(filled));
    case "choice": {
      const v = value as ChoiceValue;
      return v.selected?.length > 0 || filled(v.other) || filled(v.detail);
    }
    case "files": {
      const v = value as FilesValue;
      return v.files?.length > 0 || filled(v.links);
    }
    case "toggle":
      return !!(value as ToggleValue).answer;
  }
}

export type Answers = Record<string, AnswerValue>;

export function chapterProgress(chapter: Chapter, answers: Answers) {
  const answered = chapter.questions.filter((q) => isAnswered(q, answers[q.id])).length;
  return { answered, total: chapter.questions.length };
}

/** Índice (1-based) da primeira pergunta sem resposta, ou 1 se todas tiverem resposta. */
export function firstOpenStep(chapter: Chapter, answers: Answers) {
  const i = chapter.questions.findIndex((q) => !isAnswered(q, answers[q.id]));
  return i === -1 ? 1 : i + 1;
}
