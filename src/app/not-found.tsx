import { INSTAGRAM, Symbol } from "@/components/Brand";

export default function NotFound() {
  return (
    <main className="stage" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
      <div className="container-narrow" style={{ paddingBlock: 64 }}>
        <Symbol style={{ height: 56, color: "var(--cream)", marginBottom: 32 }} />
        <h1 className="headline">Este link não existe ou expirou.</h1>
        <p className="lead" style={{ margin: "16px auto 28px" }}>
          Confira se copiou o endereço inteiro, ou fale com a QUART.
        </p>
        <a className="pill pill-outline" href={INSTAGRAM.url} target="_blank" rel="noreferrer">
          {INSTAGRAM.handle}
        </a>
      </div>
    </main>
  );
}
