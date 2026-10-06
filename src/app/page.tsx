import Link from "next/link";
import { INSTAGRAM, Symbol } from "@/components/Brand";

export default function Home() {
  return (
    <main className="stage" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
      <div className="container-narrow" style={{ paddingBlock: 64 }}>
        <Symbol className="symbol-lit hero-symbol reveal" />
        <p className="eyebrow reveal" style={{ "--d": "0.1s" } as React.CSSProperties}>
          Pré-work · Briefing estratégico de branding
        </p>
        <h1 className="display-xl reveal" style={{ "--d": "0.16s" } as React.CSSProperties}>
          Por todo lado da marca.
        </h1>
        <p className="lead reveal" style={{ margin: "24px auto 0", "--d": "0.24s" } as React.CSSProperties}>
          Para responder o pré-work, use o link que a QUART enviou para você.
        </p>
        <div className="row reveal" style={{ justifyContent: "center", marginTop: 32, "--d": "0.32s" } as React.CSSProperties}>
          <a className="pill pill-outline" href={INSTAGRAM.url} target="_blank" rel="noreferrer">
            {INSTAGRAM.handle}
          </a>
          <Link className="pill pill-ghost" href="/admin">
            Painel
          </Link>
        </div>
      </div>
    </main>
  );
}
