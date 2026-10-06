import Link from "next/link";
import { notFound } from "next/navigation";
import { GlobalNav } from "@/components/GlobalNav";
import { Footer } from "@/components/Footer";
import { INSTAGRAM, Symbol } from "@/components/Brand";
import { CopyButton } from "@/components/CopyButton";
import { prework } from "@/content/prework";
import { chapterProgress, firstOpenStep } from "@/lib/answers";
import { getAnswers, getRespondentByToken, relationLabel } from "@/lib/repo";
import { getOrigin } from "@/lib/origin";
import { submitPrework } from "./actions";

export const dynamic = "force-dynamic";

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" }).format(new Date(d));

const delay = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

export default async function HubPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const respondent = await getRespondentByToken(token);
  if (!respondent) notFound();

  const answers = await getAnswers(respondent.id);
  const personalLink = `${await getOrigin()}/r/${token}`;
  const firstName = respondent.name.split(" ")[0];

  const chapters = prework.chapters.map((chapter) => {
    const progress = chapterProgress(chapter, answers);
    const done = respondent.chapters_done.includes(chapter.id);
    const started = progress.answered > 0 || done;
    const href = `/r/${token}/${chapter.id}${started ? `?q=${firstOpenStep(chapter, answers)}` : ""}`;
    return { chapter, progress, done, started, href };
  });
  const doneCount = chapters.filter((c) => c.done).length;
  const allDone = doneCount === chapters.length;
  const next = chapters.find((c) => !c.done);
  const remaining = chapters.filter((c) => !c.done).reduce((s, c) => s + c.chapter.minutes, 0);
  const submit = submitPrework.bind(null, token);

  return (
    <div className="stage">
      <GlobalNav home={`/r/${token}`}>
        <span>
          {respondent.name} · {respondent.role || relationLabel(respondent.relation)}
        </span>
        <a href={INSTAGRAM.url} target="_blank" rel="noreferrer">
          {INSTAGRAM.handle}
        </a>
      </GlobalNav>

      <main>
        <section className="hero container">
          <Symbol className="symbol-lit hero-symbol reveal" />
          <p className="eyebrow reveal" style={delay(0.1)}>
            Pré-work · {respondent.project_name}
          </p>
          <h1 className="display-xl reveal" style={delay(0.16)}>
            Por todo lado
            <br />
            da marca.
          </h1>
          <p className="lead reveal" style={{ marginTop: 24, ...delay(0.24) }}>
            {respondent.submitted_at ? (
              <>
                Obrigada, {firstName}. Seu pré-work foi enviado em{" "}
                <strong>{fmtDate(respondent.submitted_at)}</strong>. Você ainda pode revisar qualquer resposta.
              </>
            ) : doneCount === 0 ? (
              <>
                Olá, {firstName}. São <strong>cinco capítulos</strong> sobre a {respondent.project_name}. Responda
                no seu ritmo: tudo fica salvo e você pode voltar quando quiser.
              </>
            ) : allDone ? (
              <>Tudo respondido, {firstName}. Revise o que quiser e envie quando se sentir à vontade.</>
            ) : (
              <>
                Bom te ver de volta, {firstName}. Faltam{" "}
                <strong>
                  {chapters.length - doneCount} {chapters.length - doneCount === 1 ? "capítulo" : "capítulos"}
                </strong>
                .
              </>
            )}
          </p>
          <div className="row reveal" style={{ justifyContent: "center", marginTop: 32, ...delay(0.32) }}>
            <span className="capsule">
              {doneCount} de {chapters.length} capítulos
              {!allDone && <> · cerca de {remaining} min</>}
            </span>
            {next ? (
              <Link className="pill pill-primary" href={next.href}>
                {chapters.some((c) => c.started) ? "Continuar" : "Começar"}
              </Link>
            ) : (
              !respondent.submitted_at && (
                <form action={submit}>
                  <button className="pill pill-primary">Enviar pré-work</button>
                </form>
              )
            )}
          </div>
        </section>

        <section className="container" style={{ paddingBottom: "clamp(56px, 9vw, 112px)" }}>
          <div className="panel">
            <p className="eyebrow">Capítulos</p>
            <h2 className="headline" style={{ marginBottom: 32 }}>
              Cinco capítulos. No seu ritmo.
            </h2>
            <div className="chapter-grid">
              {chapters.map(({ chapter, progress, done, started, href }) => {
                const pct = done ? 100 : Math.round((progress.answered / progress.total) * 100);
                return (
                  <Link key={chapter.id} href={href} className="tile chapter-tile" data-done={done}>
                    <span className="chapter-num">{chapter.number}</span>
                    <h3 className="label-lg">{chapter.title}</h3>
                    <p className="small muted" style={{ margin: "8px 0 0" }}>
                      {chapter.description}
                    </p>
                    <div className="meter" data-done={done}>
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <div className="spread">
                      {done ? (
                        <span className="status">Concluído</span>
                      ) : started ? (
                        <span className="status status-muted">
                          {progress.answered} de {progress.total} respondidas
                        </span>
                      ) : (
                        <span className="status status-muted">
                          {chapter.questions.length} {chapter.questions.length === 1 ? "pergunta" : "perguntas"} ·{" "}
                          {chapter.minutes} min
                        </span>
                      )}
                      <span className="pill pill-outline pill-sm">
                        {done ? "Revisar" : started ? "Continuar" : "Começar"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container" style={{ paddingBottom: "clamp(56px, 9vw, 112px)" }}>
          <div className="surface-cream">
            <div className="steps-3">
              <div>
                <h3 className="label-lg">Salvamos enquanto você escreve.</h3>
                <p className="small muted" style={{ margin: "8px 0 0" }}>
                  Pode fechar a página no meio de uma resposta. Nada se perde.
                </p>
              </div>
              <div>
                <h3 className="label-lg">Sem se preocupar com forma.</h3>
                <p className="small muted" style={{ margin: "8px 0 0" }}>
                  Escreva como fala. Edição e formatação são com a gente.
                </p>
              </div>
              <div>
                <h3 className="label-lg">Quanto mais detalhe, melhor.</h3>
                <p className="small muted" style={{ margin: "8px 0 0" }}>
                  Dados precisos e contexto deixam a troca ao longo do projeto muito mais rica.
                </p>
              </div>
            </div>
            <div style={{ marginTop: 36 }}>
              <p className="small" style={{ margin: "0 0 10px", fontWeight: 600 }}>
                Seu link pessoal. Guarde para continuar de qualquer dispositivo.
              </p>
              <div className="link-box">
                <code>{personalLink}</code>
                <CopyButton text={personalLink} />
              </div>
            </div>
          </div>
        </section>

        {allDone && !respondent.submitted_at && (
          <section
            className="container-narrow"
            style={{ paddingBottom: "clamp(56px, 9vw, 112px)", textAlign: "center" }}
          >
            <h2 className="headline">Tudo pronto?</h2>
            <p className="lead" style={{ margin: "16px auto 28px" }}>
              Ao enviar, o time da QUART recebe suas respostas. Você ainda poderá revisá-las depois.
            </p>
            <form action={submit}>
              <button className="pill pill-primary">Enviar pré-work</button>
            </form>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
