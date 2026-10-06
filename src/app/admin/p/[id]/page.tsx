import Link from "next/link";
import { notFound } from "next/navigation";
import { GlobalNav } from "@/components/GlobalNav";
import { Logo } from "@/components/Brand";
import { AnswerView } from "@/components/AnswerView";
import { CopyButton } from "@/components/CopyButton";
import { prework } from "@/content/prework";
import { chapterProgress, type Answers } from "@/lib/answers";
import { requireAdmin } from "@/lib/auth";
import { getOrigin } from "@/lib/origin";
import {
  getProject,
  getProjectAnswers,
  listRespondents,
  relationLabel,
  type Respondent,
} from "@/lib/repo";
import { logout, removeProject, removeRespondent } from "../../actions";
import { ConfirmButton, PrintButton } from "../../forms";

export const dynamic = "force-dynamic";

const fmt = (d: Date | null) =>
  d
    ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(
        new Date(d),
      )
    : "—";

const who = (r: Respondent) => `${r.name} · ${r.role || relationLabel(r.relation)}`;

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string; r?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { view = "pessoas", r: selectedId } = await searchParams;
  const project = await getProject(id);
  if (!project) notFound();

  const [respondents, answersBy] = await Promise.all([listRespondents(id), getProjectAnswers(id)]);
  const shareLink = `${await getOrigin()}/p/${project.token}`;
  const selected = respondents.find((r) => r.id === selectedId);
  const base = `/admin/p/${id}`;

  return (
    <div className="stage">
      <GlobalNav home="/admin">
        <Link href="/admin">← Projetos</Link>
        <form action={logout}>
          <button className="pill pill-ghost pill-sm" style={{ fontSize: 12 }}>
            Sair
          </button>
        </form>
      </GlobalNav>

      <main className="container section-tight">
        <header className="print-only" style={{ marginBottom: 24 }}>
          <Logo height={18} />
        </header>

        <div style={{ margin: "24px 0 36px" }}>
          <p className="eyebrow">Pré-work</p>
          <h1 className="display">{project.name}</h1>
          {view === "pessoa" && selected && (
            <p className="lead" style={{ marginTop: 12 }}>
              {who(selected)}
            </p>
          )}
        </div>

        <div className="surface-cream no-print" style={{ marginBottom: 36, padding: "24px clamp(20px,3vw,32px)" }}>
          <p className="small" style={{ margin: "0 0 10px", fontWeight: 600 }}>
            Link do projeto. Envie para o cliente; cada pessoa entra com o próprio nome.
          </p>
          <div className="link-box">
            <code>{shareLink}</code>
            <a className="pill pill-outline pill-sm" href={`/p/${project.token}`} target="_blank" style={{ color: "#2b0a20", borderColor: "rgba(43,10,32,.3)" }}>
              Abrir
            </a>
            <CopyButton text={shareLink} />
          </div>
        </div>

        <div className="spread no-print" style={{ marginBottom: 28 }}>
          <nav className="segmented" aria-label="Visualização">
            <Link href={base} aria-current={view === "pessoas" ? "page" : undefined}>
              Pessoas
            </Link>
            <Link href={`${base}?view=comparar`} aria-current={view === "comparar" ? "page" : undefined}>
              Comparar respostas
            </Link>
            {selected && (
              <Link href={`${base}?view=pessoa&r=${selected.id}`} aria-current={view === "pessoa" ? "page" : undefined}>
                {selected.name.split(" ")[0]}
              </Link>
            )}
          </nav>
          {view !== "pessoas" && respondents.length > 0 && <PrintButton />}
        </div>

        {view === "pessoas" && (
          <PeopleView projectId={id} respondents={respondents} answersBy={answersBy} base={base} />
        )}
        {view === "comparar" && <CompareView respondents={respondents} answersBy={answersBy} />}
        {view === "pessoa" && selected && <PersonView answers={answersBy[selected.id] ?? {}} />}

        <div className="no-print" style={{ marginTop: 80, paddingTop: 24, borderTop: "1px solid var(--hair)" }}>
          <ConfirmButton
            action={removeProject.bind(null, id)}
            label="Excluir projeto"
            confirm={`Excluir "${project.name}" e todas as respostas? Isso não pode ser desfeito.`}
          />
        </div>
      </main>
    </div>
  );
}

function PeopleView({
  projectId,
  respondents,
  answersBy,
  base,
}: {
  projectId: string;
  respondents: Respondent[];
  answersBy: Record<string, Answers>;
  base: string;
}) {
  if (respondents.length === 0) {
    return (
      <div className="panel" style={{ textAlign: "center" }}>
        <h2 className="title">Ninguém respondeu ainda.</h2>
        <p className="muted" style={{ margin: "10px auto 0", maxWidth: 460 }}>
          Assim que alguém entrar pelo link, aparece aqui com o progresso de cada capítulo.
        </p>
      </div>
    );
  }
  return (
    <div className="panel" style={{ padding: "clamp(16px,3vw,32px)" }}>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Pessoa</th>
              <th>E-mail</th>
              <th>Capítulos</th>
              <th>Status</th>
              <th>Última atividade</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {respondents.map((r) => {
              const answers = answersBy[r.id] ?? {};
              return (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div className="tiny muted">{r.role || relationLabel(r.relation)}</div>
                  </td>
                  <td className="muted">{r.email}</td>
                  <td>
                    <span className="dots" title="Capítulos 01 a 05">
                      {prework.chapters.map((c) => {
                        const done = r.chapters_done.includes(c.id);
                        const partial = chapterProgress(c, answers).answered > 0;
                        return <i key={c.id} data-s={done ? "done" : partial ? "partial" : ""} title={`${c.number} · ${c.title}`} />;
                      })}
                    </span>
                  </td>
                  <td>
                    {r.submitted_at ? (
                      <span className="status">Enviado {fmt(r.submitted_at)}</span>
                    ) : (
                      <span className="status status-muted">Em andamento</span>
                    )}
                  </td>
                  <td className="muted tiny">{fmt(r.updated_at)}</td>
                  <td>
                    <div className="row" style={{ flexWrap: "nowrap", justifyContent: "flex-end" }}>
                      <Link className="pill pill-outline pill-sm" href={`${base}?view=pessoa&r=${r.id}`}>
                        Ver respostas
                      </Link>
                      <ConfirmButton
                        action={removeRespondent.bind(null, projectId, r.id)}
                        label="Remover"
                        className="pill pill-ghost pill-sm"
                        confirm={`Remover ${r.name} e todas as respostas dessa pessoa?`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PersonView({ answers }: { answers: Answers }) {
  return (
    <div>
      {prework.chapters.map((chapter, i) => (
        <section key={chapter.id} className={`panel ${i ? "chapter-break" : ""}`} style={{ marginBottom: 20 }}>
          <p className="eyebrow">{chapter.number}</p>
          <h2 className="title">{chapter.title}</h2>
          {chapter.questions.map((q) => (
            <div key={q.id} className="q-block">
              <h3 className="label-lg" style={{ marginBottom: 12 }}>
                {q.title}
              </h3>
              <AnswerView question={q} value={answers[q.id]} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function CompareView({ respondents, answersBy }: { respondents: Respondent[]; answersBy: Record<string, Answers> }) {
  if (respondents.length === 0) return <p className="muted">Ninguém respondeu ainda.</p>;
  return (
    <div>
      {prework.chapters.map((chapter, i) => (
        <section key={chapter.id} className={`panel ${i ? "chapter-break" : ""}`} style={{ marginBottom: 20 }}>
          <p className="eyebrow">{chapter.number}</p>
          <h2 className="title">{chapter.title}</h2>
          {chapter.questions.map((q) => (
            <div key={q.id} className="q-block">
              <h3 className="label-lg" style={{ marginBottom: 18 }}>
                {q.title}
              </h3>
              <div className="grid-cols" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
                {respondents.map((r) => (
                  <div key={r.id} className="tile" style={{ padding: 20 }}>
                    <p className="who">{who(r)}</p>
                    <AnswerView question={q} value={answersBy[r.id]?.[q.id]} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
