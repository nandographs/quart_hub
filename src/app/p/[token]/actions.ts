"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  RELATIONS,
  createRespondent,
  findRespondentByEmail,
  getProjectByToken,
} from "@/lib/repo";

export type EntryState = { error?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function startResponse(
  projectToken: string,
  _prev: EntryState,
  form: FormData,
): Promise<EntryState> {
  const project = await getProjectByToken(projectToken);
  if (!project) return { error: "Este link não é mais válido. Fale com a QUART." };

  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const relation = String(form.get("relation") ?? "");
  const role = String(form.get("role") ?? "").trim().slice(0, 120) || null;

  if (!name) return { error: "Conte pra gente o seu nome." };
  if (!EMAIL.test(email)) return { error: "Confira o seu e-mail." };
  if (!RELATIONS.some((r) => r.id === relation)) return { error: "Escolha a sua relação com a empresa." };

  // Mesmo e-mail no mesmo projeto: retoma de onde a pessoa parou.
  const respondent =
    (await findRespondentByEmail(project.id, email)) ??
    (await createRespondent({ projectId: project.id, name, email, relation, role }));

  (await cookies()).set(`qr_${project.id}`, respondent.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  redirect(`/r/${respondent.token}`);
}
