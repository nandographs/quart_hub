import { redirect } from "next/navigation";
import { Logo } from "@/components/Brand";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "../forms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Painel" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="stage" style={{ display: "grid", placeItems: "center", padding: 16 }}>
      <div className="panel reveal" style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <Logo height={26} className="" />
        <h1 className="title" style={{ margin: "28px 0 6px" }}>
          Painel do pré-work
        </h1>
        <p className="small muted" style={{ margin: "0 0 28px" }}>
          Acesso restrito ao time da QUART.
        </p>
        <div style={{ textAlign: "left" }}>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
