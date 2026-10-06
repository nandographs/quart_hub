"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AnswerValue, Chapter } from "@/content/types";
import { QuestionInput, type StorageMode } from "@/components/form/QuestionInput";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type NextChapter = { id: string; number: string; title: string } | null;

const SAVE_DELAY = 700;

function useAutosave(token: string) {
  const pending = useRef<Record<string, AnswerValue>>({});
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [status, setStatus] = useState<SaveStatus>("idle");

  const flush = useCallback(async (): Promise<boolean> => {
    clearTimeout(timer.current);
    const batch = pending.current;
    if (Object.keys(batch).length === 0) return true;
    pending.current = {};
    setStatus("saving");
    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, answers: batch }),
      });
      if (!res.ok) throw new Error();
      setStatus(Object.keys(pending.current).length ? "saving" : "saved");
      return true;
    } catch {
      // Devolve ao pendente sem sobrescrever o que foi digitado depois, e tenta de novo
      pending.current = { ...batch, ...pending.current };
      setStatus("error");
      timer.current = setTimeout(flush, 3000);
      return false;
    }
  }, [token]);

  const queue = useCallback(
    (questionId: string, value: AnswerValue) => {
      pending.current[questionId] = value;
      setStatus("saving");
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, SAVE_DELAY);
    },
    [flush],
  );

  // Ao fechar ou trocar de aba, envia o que faltar mesmo com a página saindo
  useEffect(() => {
    const onHide = () => {
      if (Object.keys(pending.current).length === 0) return;
      const body = new Blob([JSON.stringify({ token, answers: pending.current })], { type: "application/json" });
      if (navigator.sendBeacon("/api/answers", body)) pending.current = {};
    };
    const onVisibility = () => document.visibilityState === "hidden" && onHide();
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [token]);

  return { status, queue, flush };
}

export function ChapterFlow({
  token,
  chapter,
  initialAnswers,
  initialStep,
  nextChapter,
  storageMode,
}: {
  token: string;
  chapter: Chapter;
  initialAnswers: Record<string, AnswerValue>;
  initialStep: number;
  nextChapter: NextChapter;
  storageMode: StorageMode;
}) {
  const total = chapter.questions.length;
  const doneStep = total + 1;
  const [step, setStep] = useState(initialStep);
  const [values, setValues] = useState(initialAnswers);
  const [finishing, setFinishing] = useState(false);
  const { status, queue, flush } = useAutosave(token);

  const question = step >= 1 && step <= total ? chapter.questions[step - 1] : undefined;

  const go = useCallback(
    (to: number) => {
      void flush();
      setStep(to);
      const url = new URL(window.location.href);
      if (to >= 1 && to <= total) url.searchParams.set("q", String(to));
      else url.searchParams.delete("q");
      window.history.replaceState(null, "", url);
      window.scrollTo({ top: 0 });
    },
    [flush, total],
  );

  const finish = useCallback(async () => {
    setFinishing(true);
    await flush();
    await fetch("/api/chapters", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, chapterId: chapter.id }),
    }).catch(() => {});
    setFinishing(false);
    go(doneStep);
  }, [flush, token, chapter.id, go, doneStep]);

  const advance = useCallback(() => {
    if (step < total) go(step + 1);
    else if (step === total) void finish();
  }, [step, total, go, finish]);

  // Ctrl/Cmd + Enter avança
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && step >= 1 && step <= total) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, step, total]);

  // Foca o primeiro campo de texto ao trocar de pergunta (só com mouse, para não abrir o teclado no celular)
  useEffect(() => {
    if (!question || !["text", "fields", "list"].includes(question.kind)) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = document.querySelector<HTMLElement>(".answer textarea, .answer input:not([type=file])");
    el?.focus({ preventScroll: true });
  }, [question]);

  const setValue = (questionId: string, value: AnswerValue) => {
    setValues((prev) => ({ ...prev, [questionId]: value }));
    queue(questionId, value);
  };

  const progressPct = step === 0 ? 0 : Math.min(100, Math.round(((step - 1) / total) * 100));

  return (
    <>
      <nav className="local-nav" aria-label="Capítulo">
        <Link href={`/r/${token}`} className="pill pill-ghost pill-sm" onClick={() => void flush()}>
          ← Capítulos
        </Link>
        <span className="chapter-name">
          {chapter.number} · {chapter.title}
        </span>
        <span className="row" style={{ gap: 14, flexWrap: "nowrap", paddingRight: 12 }}>
          <SaveIndicator status={status} />
          {question && (
            <span className="tiny muted" style={{ whiteSpace: "nowrap" }}>
              {step} / {total}
            </span>
          )}
        </span>
        <span className="progress" aria-hidden>
          <span style={{ width: `${step === doneStep ? 100 : progressPct}%` }} />
        </span>
      </nav>

      <main className="container flow">
        {step === 0 && (
          <section key="intro" style={{ textAlign: "center" }}>
            <p className="display-xl reveal" style={{ color: "rgba(246,240,232,0.16)" }} aria-hidden>
              {chapter.number}
            </p>
            <h1 className="display reveal" style={{ "--d": "0.08s", marginTop: 8 } as React.CSSProperties}>
              {chapter.title}
            </h1>
            <p className="lead reveal" style={{ margin: "20px auto 0", "--d": "0.16s" } as React.CSSProperties}>
              {chapter.description}
            </p>
            <div className="row reveal" style={{ justifyContent: "center", marginTop: 36, "--d": "0.24s" } as React.CSSProperties}>
              <span className="capsule">
                {total} {total === 1 ? "pergunta" : "perguntas"} · cerca de {chapter.minutes} min
              </span>
              <button className="pill pill-primary" onClick={() => go(1)} autoFocus>
                Começar
              </button>
            </div>
          </section>
        )}

        {question && (
          <section
            key={question.id}
            className="container-narrow"
            // Perguntas em três colunas ganham a largura toda do palco
            style={{ padding: 0, maxWidth: question.kind === "fields" && question.layout === "columns" ? 1080 : undefined }}
          >
            <div className="frame frame-focus">
              {question.optional && (
                <p className="status reveal" style={{ margin: "0 0 12px" }}>
                  Opcional
                </p>
              )}
              <h1 className="question-title reveal">{question.title}</h1>
              {question.hint && (
                <p className="question-hint reveal" style={{ "--d": "0.06s" } as React.CSSProperties}>
                  {question.hint}
                </p>
              )}
            </div>
            <div className="answer reveal" style={{ "--d": "0.12s" } as React.CSSProperties}>
              <QuestionInput
                question={question}
                value={values[question.id]}
                onChange={(v) => setValue(question.id, v)}
                token={token}
                storageMode={storageMode}
              />
            </div>
            <div className="flow-actions">
              <button className="pill pill-outline" onClick={() => go(step - 1)}>
                Voltar
              </button>
              <span className="row" style={{ gap: 16 }}>
                <span className="kbd-hint">Ctrl + Enter para continuar</span>
                <button className="pill pill-primary" onClick={advance} disabled={finishing}>
                  {step === total ? (finishing ? "Concluindo…" : "Concluir capítulo") : "Continuar"}
                </button>
              </span>
            </div>
          </section>
        )}

        {step === doneStep && (
          <section key="done" className="container-narrow" style={{ textAlign: "center", padding: 0 }}>
            <div className="frame frame-focus">
              <p className="eyebrow reveal">Capítulo {chapter.number} concluído</p>
              <h1 className="display reveal" style={{ "--d": "0.08s" } as React.CSSProperties}>
                {nextChapter ? "Um a menos." : "Tudo respondido."}
              </h1>
              <p className="lead reveal" style={{ margin: "20px auto 0", "--d": "0.16s" } as React.CSSProperties}>
                {nextChapter
                  ? `Suas respostas estão salvas. Siga para o capítulo ${nextChapter.number} agora ou volte quando quiser.`
                  : "Suas respostas estão salvas. Revise o que quiser e envie o pré-work para a QUART."}
              </p>
            </div>
            <div className="row reveal" style={{ justifyContent: "center", marginTop: 28, "--d": "0.24s" } as React.CSSProperties}>
              <Link className="pill pill-outline" href={`/r/${token}`}>
                Ver capítulos
              </Link>
              {nextChapter ? (
                <Link className="pill pill-primary" href={`/r/${token}/${nextChapter.id}`}>
                  {nextChapter.number} · {nextChapter.title}
                </Link>
              ) : (
                <Link className="pill pill-primary" href={`/r/${token}`}>
                  Revisar e enviar
                </Link>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  const label =
    status === "saving" ? "Salvando…" : status === "saved" ? "Salvo" : status === "error" ? "Sem conexão, tentando de novo" : "";
  return (
    <span
      className="tiny"
      aria-live="polite"
      style={{
        color: status === "error" ? "#f0a8a8" : status === "saved" ? "var(--sage)" : "var(--ash)",
        whiteSpace: "nowrap",
        transition: "opacity .3s",
        opacity: label ? 1 : 0,
      }}
    >
      {label}
    </span>
  );
}
