import { INSTAGRAM, Symbol } from "./Brand";

export function Footer() {
  return (
    <footer className="footer no-print">
      <div className="container spread">
        <span className="row" style={{ gap: 10 }}>
          <Symbol style={{ height: 18, color: "var(--cream)" }} />
          <span>Por todo lado da marca.</span>
        </span>
        <a href={INSTAGRAM.url} target="_blank" rel="noreferrer" style={{ color: "var(--ash)" }}>
          {INSTAGRAM.handle}
        </a>
      </div>
    </footer>
  );
}
