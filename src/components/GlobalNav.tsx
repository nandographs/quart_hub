import Link from "next/link";
import { Logo } from "./Brand";

export function GlobalNav({ home = "/", children }: { home?: string; children?: React.ReactNode }) {
  return (
    <header className="gnav">
      <div className="container gnav-inner">
        <Link href={home} aria-label="Início" style={{ color: "var(--cream)", display: "flex" }}>
          <Logo height={15} />
        </Link>
        <div className="gnav-meta">{children}</div>
      </div>
    </header>
  );
}
