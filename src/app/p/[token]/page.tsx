import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { GlobalNav } from "@/components/GlobalNav";
import { Footer } from "@/components/Footer";
import { INSTAGRAM } from "@/components/Brand";
import { prework, totalMinutes } from "@/content/prework";
import { RELATIONS, getProjectByToken, getRespondentByToken } from "@/lib/repo";
import { EntryForm } from "./EntryForm";

export const dynamic = "force-dynamic";

export default async function EntryPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const project = await getProjectByToken(token);
  if (!project) notFound();

  const saved = (await cookies()).get(`qr_${project.id}`)?.value;
  const current = saved ? await getRespondentByToken(saved) : undefined;

  return (
    <div className="stage">
      <GlobalNav home={`/p/${token}`}>
        <span>{prework.title}</span>
        <a href={INSTAGRAM.url} target="_blank" rel="noreferrer">{INSTAGRAM.handle}</a>
      </GlobalNav>

      <main>
        <section className="hero container">
          <p className="eyebrow reveal">Pré-work · {prework.subtitle}</p>
          <h1 className="display-xl reveal" style={{ "--d": "0.08s" } as React.CSSProperties}>
            Olá, {project.name}.
          </h1>
          <p className="lead reveal" style={{ marginTop: 24, "--d": "0.16s" } as React.CSSProperties}>
            Este briefing é o ponto de partida do seu projeto com a QUART. Ele nos ajuda a entender
            o contexto, os desafios e as ambições da sua marca, para construir uma estratégia de
            branding sólida, da identidade à implementação.
          </p>
          <div className="row reveal" style={{ justifyContent: "center", marginTop: 32, "--d": "0.24s" } as React.CSSProperties}>
            <span className="capsule">
              {prework.chapters.length} capítulos · cerca de {totalMinutes} min · salva sozinho
            </span>
            {current && current.project_id === project.id && (
              <Link className="pill pill-primary" href={`/r/${current.token}`}>
                Continuar como {current.name.split(" ")[0]}
              </Link>
            )}
          </div>
        </section>

        <section className="container-narrow" style={{ paddingBottom: "clamp(64px, 10vw, 120px)" }}>
          <div className="panel reveal" style={{ "--d": "0.32s" } as React.CSSProperties}>
            <h2 className="title">Antes de começar, quem está respondendo?</h2>
            <p className="muted" style={{ margin: "10px 0 32px" }}>
              Cada pessoa responde com o próprio nome. Donos, sócios, equipe e marketing:
              olhares diferentes enriquecem o projeto.
            </p>
            <EntryForm projectToken={token} relations={RELATIONS} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
