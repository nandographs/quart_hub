import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { query } from "./db";
import type { AnswerValue } from "@/content/types";
import type { Answers } from "./answers";

export type Project = { id: string; name: string; token: string; created_at: Date };

export type Respondent = {
  id: string;
  project_id: string;
  token: string;
  name: string;
  email: string;
  relation: string;
  role: string | null;
  chapters_done: string[];
  submitted_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export const RELATIONS = [
  { id: "dono", label: "Dono(a)" },
  { id: "socio", label: "Sócio(a)" },
  { id: "colaborador", label: "Colaborador(a)" },
  { id: "marketing", label: "Marketing" },
  { id: "outro", label: "Outro" },
] as const;

export const relationLabel = (id: string) => RELATIONS.find((r) => r.id === id)?.label ?? id;

const newToken = () => randomBytes(18).toString("base64url");

// Projetos

export async function createProject(name: string) {
  const [project] = await query<Project>(
    "insert into projects (id, name, token) values ($1, $2, $3) returning *",
    [randomUUID(), name, newToken()],
  );
  return project;
}

export async function listProjects() {
  return query<Project & { respondents: number; submitted: number; last_activity: Date | null }>(
    `select p.*,
       count(r.id)::int as respondents,
       count(r.submitted_at)::int as submitted,
       max(r.updated_at) as last_activity
     from projects p
     left join respondents r on r.project_id = p.id
     group by p.id
     order by p.created_at desc`,
  );
}

export async function getProject(id: string) {
  const [project] = await query<Project>("select * from projects where id = $1", [id]);
  return project;
}

export async function getProjectByToken(token: string) {
  const [project] = await query<Project>("select * from projects where token = $1", [token]);
  return project;
}

export async function deleteProject(id: string) {
  await query("delete from projects where id = $1", [id]);
}

// Respondentes

export async function findRespondentByEmail(projectId: string, email: string) {
  const [r] = await query<Respondent>(
    "select * from respondents where project_id = $1 and lower(email) = lower($2)",
    [projectId, email],
  );
  return r;
}

export async function createRespondent(input: {
  projectId: string;
  name: string;
  email: string;
  relation: string;
  role: string | null;
}) {
  const [r] = await query<Respondent>(
    `insert into respondents (id, project_id, token, name, email, relation, role)
     values ($1, $2, $3, $4, $5, $6, $7) returning *`,
    [randomUUID(), input.projectId, newToken(), input.name, input.email, input.relation, input.role],
  );
  return r;
}

export async function getRespondentByToken(token: string) {
  const [row] = await query<Respondent & { project_name: string }>(
    `select r.*, p.name as project_name
     from respondents r join projects p on p.id = r.project_id
     where r.token = $1`,
    [token],
  );
  return row;
}

export async function listRespondents(projectId: string) {
  return query<Respondent>(
    "select * from respondents where project_id = $1 order by created_at",
    [projectId],
  );
}

export async function deleteRespondent(id: string) {
  await query("delete from respondents where id = $1", [id]);
}

export async function markChapterDone(respondentId: string, chapterId: string) {
  await query(
    `update respondents
     set chapters_done = case when chapters_done ? $2 then chapters_done
                              else chapters_done || to_jsonb($2::text) end,
         updated_at = now()
     where id = $1`,
    [respondentId, chapterId],
  );
}

export async function markSubmitted(respondentId: string) {
  await query(
    "update respondents set submitted_at = coalesce(submitted_at, now()), updated_at = now() where id = $1",
    [respondentId],
  );
}

// Respostas

export async function saveAnswer(respondentId: string, questionId: string, value: AnswerValue) {
  await query(
    `insert into answers (respondent_id, question_id, value, updated_at)
     values ($1, $2, $3::jsonb, now())
     on conflict (respondent_id, question_id)
     do update set value = excluded.value, updated_at = now()`,
    [respondentId, questionId, JSON.stringify(value)],
  );
  await query("update respondents set updated_at = now() where id = $1", [respondentId]);
}

export async function getAnswers(respondentId: string): Promise<Answers> {
  const rows = await query<{ question_id: string; value: AnswerValue }>(
    "select question_id, value from answers where respondent_id = $1",
    [respondentId],
  );
  return Object.fromEntries(rows.map((r) => [r.question_id, r.value]));
}

export async function getProjectAnswers(projectId: string) {
  const rows = await query<{ respondent_id: string; question_id: string; value: AnswerValue }>(
    `select a.respondent_id, a.question_id, a.value
     from answers a join respondents r on r.id = a.respondent_id
     where r.project_id = $1`,
    [projectId],
  );
  const byRespondent: Record<string, Answers> = {};
  for (const row of rows) {
    (byRespondent[row.respondent_id] ??= {})[row.question_id] = row.value;
  }
  return byRespondent;
}
