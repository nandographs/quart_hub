import type { AnswerValue, FieldDef, FileRef, Question } from "@/content/types";

const MAX_TEXT = 20_000;
const MAX_ITEMS = 40;

const str = (v: unknown, max = MAX_TEXT) => (typeof v === "string" ? v.slice(0, max) : "");
const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

const pickFields = (raw: unknown, fields: FieldDef[]) => {
  const o = obj(raw);
  return Object.fromEntries(fields.map((f) => [f.id, str(o[f.id])]));
};

const isFileUrl = (url: string) => url.startsWith("/api/files/") || /^https:\/\/[\w.-]+\.blob\.vercel-storage\.com\//.test(url);

/** Converte o que chegou do navegador para o formato esperado da pergunta, descartando o resto. */
export function sanitizeAnswer(question: Question, raw: unknown): AnswerValue {
  switch (question.kind) {
    case "text":
      return str(raw);
    case "fields":
      return pickFields(raw, question.fields);
    case "list":
      return (Array.isArray(raw) ? raw : []).slice(0, MAX_ITEMS).map((item) => pickFields(item, question.fields));
    case "choice": {
      const o = obj(raw);
      const ids = new Set(question.options.map((opt) => opt.id));
      const selected = (Array.isArray(o.selected) ? o.selected : []).filter(
        (s): s is string => typeof s === "string" && ids.has(s),
      );
      return {
        selected: question.multiple ? [...new Set(selected)] : selected.slice(0, 1),
        other: question.other ? str(o.other, 500) : undefined,
        detail: question.detail ? str(o.detail) : undefined,
      };
    }
    case "files": {
      const o = obj(raw);
      const files: FileRef[] = (Array.isArray(o.files) ? o.files : [])
        .slice(0, MAX_ITEMS)
        .map(obj)
        .map((f) => ({
          url: str(f.url, 1000),
          name: str(f.name, 300),
          size: typeof f.size === "number" ? f.size : 0,
          type: str(f.type, 200),
        }))
        .filter((f) => isFileUrl(f.url));
      return { files, links: question.links ? str(o.links, 5000) : undefined };
    }
    case "toggle": {
      const o = obj(raw);
      const answer = o.answer === "sim" || o.answer === "nao" ? o.answer : undefined;
      return { answer, detail: str(o.detail) };
    }
  }
}
