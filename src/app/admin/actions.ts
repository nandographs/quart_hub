"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, endAdminSession, requireAdmin, startAdminSession } from "@/lib/auth";
import { createProject, deleteProject, deleteRespondent } from "@/lib/repo";

export type FormState = { error?: string };

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  if (!checkPassword(String(form.get("password") ?? ""))) return { error: "Senha incorreta." };
  await startAdminSession();
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}

export async function newProject(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  if (!name) return { error: "Dê um nome ao projeto." };
  const project = await createProject(name);
  redirect(`/admin/p/${project.id}`);
}

export async function removeProject(id: string) {
  await requireAdmin();
  await deleteProject(id);
  redirect("/admin");
}

export async function removeRespondent(projectId: string, respondentId: string) {
  await requireAdmin();
  await deleteRespondent(respondentId);
  revalidatePath(`/admin/p/${projectId}`);
}
