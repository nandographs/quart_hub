import type {
  AnswerValue,
  ChoiceValue,
  FieldsValue,
  FilesValue,
  ListValue,
  Question,
  ToggleValue,
} from "@/content/types";
import { isAnswered } from "@/lib/answers";

const has = (s?: string) => !!s && s.trim().length > 0;

export function AnswerView({ question, value }: { question: Question; value: AnswerValue | undefined }) {
  if (!isAnswered(question, value)) return <p className="answer-empty">Sem resposta</p>;

  switch (question.kind) {
    case "text":
      return <div className="answer-view">{value as string}</div>;

    case "fields": {
      const v = value as FieldsValue;
      return (
        <div className="answer-view">
          {question.fields
            .filter((f) => has(v[f.id]))
            .map((f) => (
              <div key={f.id}>
                <span className="k">{f.label}</span>
                {v[f.id]}
              </div>
            ))}
        </div>
      );
    }

    case "list": {
      const items = (value as ListValue).filter((item) => Object.values(item).some(has));
      return (
        <div className="answer-view">
          {items.map((item, i) => (
            <div key={i} style={{ marginTop: i ? 18 : 0 }}>
              <span className="k">
                {question.itemLabel} {i + 1}
              </span>
              {question.fields
                .filter((f) => has(item[f.id]))
                .map((f) => (
                  <div key={f.id}>
                    <span className="muted">{f.label}: </span>
                    <Linkify text={item[f.id]} />
                  </div>
                ))}
            </div>
          ))}
        </div>
      );
    }

    case "choice": {
      const v = value as ChoiceValue;
      const labels = question.options.filter((o) => v.selected?.includes(o.id)).map((o) => o.description ?? o.label);
      if (has(v.other)) labels.push(`Outro: ${v.other}`);
      return (
        <div className="answer-view">
          {labels.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {labels.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          )}
          {has(v.detail) && (
            <div>
              <span className="k">{question.detail?.label}</span>
              {v.detail}
            </div>
          )}
        </div>
      );
    }

    case "files": {
      const v = value as FilesValue;
      return (
        <div className="answer-view">
          {v.files?.map((f) => (
            <div key={f.url}>
              <a href={f.url} target="_blank" rel="noreferrer">
                {f.name}
              </a>
            </div>
          ))}
          {has(v.links) && (
            <div>
              <span className="k">Links</span>
              <Linkify text={v.links!} />
            </div>
          )}
        </div>
      );
    }

    case "toggle": {
      const v = value as ToggleValue;
      return (
        <div className="answer-view">
          {v.answer === "sim" ? question.yesLabel : question.noLabel}
          {v.answer === "sim" && has(v.detail) && (
            <div>
              <span className="k">{question.detail.label}</span>
              {v.detail}
            </div>
          )}
        </div>
      );
    }
  }
}

function Linkify({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noreferrer">
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}
