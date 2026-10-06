export type FieldDef = {
  id: string;
  label: string;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
};

type Base = {
  id: string;
  title: string;
  hint?: string;
  optional?: boolean;
};

export type TextQuestion = Base & { kind: "text"; placeholder?: string };

export type FieldsQuestion = Base & {
  kind: "fields";
  fields: FieldDef[];
  layout?: "stack" | "columns";
};

export type ListQuestion = Base & {
  kind: "list";
  itemLabel: string;
  addLabel: string;
  fields: FieldDef[];
};

export type ChoiceOption = { id: string; label: string; description?: string };

export type ChoiceQuestion = Base & {
  kind: "choice";
  multiple: boolean;
  variant: "chips" | "cards";
  options: ChoiceOption[];
  other?: boolean;
  detail?: FieldDef;
};

export type FilesQuestion = Base & { kind: "files"; links?: boolean };

export type ToggleQuestion = Base & {
  kind: "toggle";
  yesLabel: string;
  noLabel: string;
  detail: FieldDef;
};

export type Question =
  | TextQuestion
  | FieldsQuestion
  | ListQuestion
  | ChoiceQuestion
  | FilesQuestion
  | ToggleQuestion;

export type Chapter = {
  id: string;
  number: string;
  title: string;
  description: string;
  minutes: number;
  questions: Question[];
};

export type Questionnaire = {
  id: string;
  title: string;
  subtitle: string;
  chapters: Chapter[];
};

// Formato dos valores salvos para cada tipo de pergunta
export type FileRef = { url: string; name: string; size: number; type: string };
export type TextValue = string;
export type FieldsValue = Record<string, string>;
export type ListValue = Record<string, string>[];
export type ChoiceValue = { selected: string[]; other?: string; detail?: string };
export type FilesValue = { files: FileRef[]; links?: string };
export type ToggleValue = { answer?: "sim" | "nao"; detail?: string };
export type AnswerValue =
  | TextValue
  | FieldsValue
  | ListValue
  | ChoiceValue
  | FilesValue
  | ToggleValue;
