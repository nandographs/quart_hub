import Link from "next/link";
import { GlobalNav } from "@/components/GlobalNav";
import { requireAdmin } from "@/lib/auth";
import { listProjects } from "@/lib/repo";
import { logout } from "./actions";
import { NewProjectForm } from "./forms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Projetos" };

const fmt = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(d)) : "—";

export default async function AdminHome() {
  await requireAdmin();
  const projects = await listProjects();

  return (
    <div className="stage">
      <GlobalNav home="/admin">
        <span>Painel</span>
        <form action={logout}>
          <button className="pill pill-ghost pill-sm" style={{ fontSize: 12 }}>
            Sair
          </button>
        </form>
      </GlobalNav>

      <main className="container section-tight">
        <div className="spread" style={{ alignItems: "flex-end", margin: "24px 0 40px" }}>
          <div>
            <p className="eyebrow">Pré-work</p>
            <h1 className="display">Projetos.</h1>
          </div>
          <div style={{ width: "100%", maxWidth: 480 }}>
            <NewProjectForm />
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="panel" style={{ textAlign: "center" }}>
            <h2 className="title">Nenhum projeto ainda.</h2>
            <p className="muted" style={{ margin: "10px auto 0", maxWidth: 460 }}>
              Crie o primeiro com o nome do cliente. Você recebe um link para enviar à equipe do cliente.
            </p>
          </div>
        ) : (
          <div className="chapter-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {projects.map((p) => (
              <Link key={p.id} href={`/admin/p/${p.id}`} className="tile chapter-tile" style={{ minHeight: 200 }}>
                <span className="status status-muted" style={{ marginBottom: "auto" }}>
                  Criado em {fmt(p.created_at)}
                </span>
                <h2 className="title" style={{ marginTop: 32 }}>
                  {p.name}
                </h2>
                <div className="spread" style={{ marginTop: 14 }}>
                  <span className="small muted">
                    {p.respondents} {p.respondents === 1 ? "pessoa" : "pessoas"} ·{" "}
                    <span style={{ color: p.submitted ? "var(--sage)" : undefined }}>
                      {p.submitted} {p.submitted === 1 ? "enviou" : "enviaram"}
                    </span>
                  </span>
                  <span className="tiny muted">{p.last_activity ? `Ativo ${fmt(p.last_activity)}` : ""}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
