"use client";

import { useState } from "react";
import type {
  AnswerValue,
  ChoiceQuestion,
  ChoiceValue,
  FieldsQuestion,
  FieldsValue,
  FilesQuestion,
  FilesValue,
  ListQuestion,
  ListValue,
  Question,
  ToggleQuestion,
  ToggleValue,
} from "@/content/types";
import { AutoTextarea, Field } from "./fields";
import { FilesInput } from "./FilesInput";

export type StorageMode = "blob" | "local";

type Props<Q extends Question, V> = {
  question: Q;
  value: V | undefined;
  onChange: (v: V) => void;
};

export function QuestionInput({
  question,
  value,
  onChange,
  token,
  storageMode,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  token: string;
  storageMode: StorageMode;
}) {
  switch (question.kind) {
    case "text":
      return (
        <AutoTextarea
          aria-label={question.title}
          value={(value as string) ?? ""}
          onChange={onChange}
          placeholder={question.placeholder ?? "Escreva aqui…"}
          minRows={6}
        />
      );
    case "fields":
      return <FieldsInput question={question} value={value as FieldsValue} onChange={onChange} />;
    case "list":
      return <ListInput question={question} value={value as ListValue} onChange={onChange} />;
    case "choice":
      return <ChoiceInput question={question} value={value as ChoiceValue} onChange={onChange} />;
    case "toggle":
      return <ToggleInput question={question} value={value as ToggleValue} onChange={onChange} />;
    case "files":
      return (
        <FilesInput
          question={question as FilesQuestion}
          value={value as FilesValue}
          onChange={onChange}
          token={token}
          storageMode={storageMode}
        />
      );
  }
}

function FieldsInput({ question, value, onChange }: Props<FieldsQuestion, FieldsValue>) {
  const v = value ?? {};
  const columns = question.layout === "columns";
  return (
    <div className={`grid-cols ${columns ? "grid-cols-3" : ""}`} style={{ gap: columns ? 16 : 22 }}>
      {question.fields.map((f) => (
        <Field
          key={f.id}
          def={f}
          value={v[f.id] ?? ""}
          onChange={(text) => onChange({ ...v, [f.id]: text })}
          compact={columns}
        />
      ))}
    </div>
  );
}

function ListInput({ question, value, onChange }: Props<ListQuestion, ListValue>) {
  const items = value && value.length > 0 ? value : [{}];
  const single = question.fields.filter((f) => !f.multiline);
  const multi = question.fields.filter((f) => f.multiline);

  const update = (index: number, fieldId: string, text: string) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [fieldId]: text } : item)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="list-item">
          <div className="spread" style={{ marginBottom: 16 }}>
            <span className="status">
              {question.itemLabel} {index + 1}
            </span>
            {items.length > 1 && (
              <button type="button" className="pill pill-ghost pill-sm" onClick={() => remove(index)}>
                Remover
              </button>
            )}
          </div>
          <div className="stack" style={{ "--gap": "16px" } as React.CSSProperties}>
            {single.length > 0 && (
              <div className={`grid-cols ${single.length > 1 ? "grid-cols-2" : ""}`}>
                {single.map((f) => (
                  <Field
                    key={f.id}
                    def={f}
                    value={item[f.id] ?? ""}
                    onChange={(t) => update(index, f.id, t)}
                  />
                ))}
              </div>
            )}
            {multi.map((f) => (
              <Field key={f.id} def={f} value={item[f.id] ?? ""} onChange={(t) => update(index, f.id, t)} compact />
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        className="pill pill-outline"
        style={{ marginTop: 16 }}
        onClick={() => onChange([...items, {}])}
      >
        + {question.addLabel}
      </button>
    </div>
  );
}

function ChoiceInput({ question, value, onChange }: Props<ChoiceQuestion, ChoiceValue>) {
  const v: ChoiceValue = value ?? { selected: [] };
  const selected = v.selected ?? [];
  const [showOther, setShowOther] = useState(!!v.other);

  const toggle = (id: string) => {
    const has = selected.includes(id);
    const next = question.multiple
      ? has
        ? selected.filter((s) => s !== id)
        : [...selected, id]
      : has
        ? []
        : [id];
    onChange({ ...v, selected: next });
  };

  return (
    <div className="stack" style={{ "--gap": "24px" } as React.CSSProperties}>
      {question.variant === "cards" ? (
        <div className="choice-cards">
          {question.options.map((o) => (
            <button
              key={o.id}
              type="button"
              className="choice-card"
              aria-pressed={selected.includes(o.id)}
              onClick={() => toggle(o.id)}
            >
              <span className="check" aria-hidden>
                {selected.includes(o.id) && <CheckIcon />}
              </span>
              <span className="label-lg" style={{ display: "block", paddingRight: 32 }}>
                {o.label}
              </span>
              {o.description && (
                <span className="small muted" style={{ display: "block", marginTop: 8 }}>
                  {o.description}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="chips" role="group" aria-label={question.title}>
          {question.options.map((o) => (
            <button
              key={o.id}
              type="button"
              className="chip"
              aria-pressed={selected.includes(o.id)}
              onClick={() => toggle(o.id)}
            >
              {o.label}
            </button>
          ))}
          {question.other && (
            <button
              type="button"
              className="chip"
              aria-pressed={showOther}
              onClick={() => {
                if (showOther) onChange({ ...v, other: "" });
                setShowOther(!showOther);
              }}
            >
              Outro
            </button>
          )}
        </div>
      )}
      {question.other && showOther && (
        <input
          className="input"
          autoFocus
          placeholder="Quais outros?"
          value={v.other ?? ""}
          onChange={(e) => onChange({ ...v, other: e.target.value })}
        />
      )}
      {question.detail && (
        <Field def={question.detail} value={v.detail ?? ""} onChange={(t) => onChange({ ...v, detail: t })} />
      )}
    </div>
  );
}

function ToggleInput({ question, value, onChange }: Props<ToggleQuestion, ToggleValue>) {
  const v = value ?? {};
  return (
    <div className="stack" style={{ "--gap": "24px" } as React.CSSProperties}>
      <div className="choice-cards">
        {(["sim", "nao"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            className="choice-card"
            aria-pressed={v.answer === opt}
            onClick={() => onChange({ ...v, answer: v.answer === opt ? undefined : opt })}
          >
            <span className="check" aria-hidden>
              {v.answer === opt && <CheckIcon />}
            </span>
            <span className="label-lg">{opt === "sim" ? question.yesLabel : question.noLabel}</span>
          </button>
        ))}
      </div>
      {v.answer === "sim" && (
        <Field
          def={question.detail}
          value={v.detail ?? ""}
          onChange={(t) => onChange({ ...v, detail: t })}
          autoFocus
        />
      )}
    </div>
  );
}

export function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 6.2 5 8.6l4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
