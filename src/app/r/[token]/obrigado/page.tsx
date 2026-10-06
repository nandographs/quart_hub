import Link from "next/link";
import { notFound } from "next/navigation";
import { INSTAGRAM, Symbol } from "@/components/Brand";
import { getRespondentByToken } from "@/lib/repo";

export const dynamic = "force-dynamic";

const delay = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

export default async function ThanksPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const respondent = await getRespondentByToken(token);
  if (!respondent) notFound();

  return (
    <main className="stage" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
      <div className="container-narrow" style={{ paddingBlock: 64 }}>
        <Symbol className="symbol-lit hero-symbol reveal" />
        <h1 className="display-xl reveal" style={delay(0.1)}>
          Obrigada.
        </h1>
        <p className="display reveal" style={{ color: "var(--ash)", ...delay(0.2) }}>
          Vamos juntos?
        </p>
        <p className="lead reveal" style={{ margin: "32px auto 0", ...delay(0.3) }}>
          Recebemos o seu pré-work, {respondent.name.split(" ")[0]}. O time da QUART vai ler cada resposta com
          cuidado antes do nosso próximo encontro.
        </p>
        <div className="row reveal" style={{ justifyContent: "center", marginTop: 36, ...delay(0.4) }}>
          <Link className="pill pill-outline" href={`/r/${token}`}>
            Revisar respostas
          </Link>
          <a className="pill pill-primary" href={INSTAGRAM.url} target="_blank" rel="noreferrer">
            {INSTAGRAM.handle}
          </a>
        </div>
      </div>
    </main>
  );
}
