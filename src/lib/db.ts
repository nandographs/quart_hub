import "server-only";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import postgres, { type Sql } from "postgres";

type Row = Record<string, unknown>;

const SCHEMA = `
create table if not exists projects (
  id text primary key,
  name text not null,
  token text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists respondents (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  token text not null unique,
  name text not null,
  email text not null,
  relation text not null,
  role text,
  chapters_done jsonb not null default '[]'::jsonb,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists respondents_project_email
  on respondents (project_id, lower(email));

create table if not exists answers (
  respondent_id text not null references respondents(id) on delete cascade,
  question_id text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (respondent_id, question_id)
);

-- O app conecta como dono das tabelas e não é afetado. Sem políticas, o RLS fecha o acesso
-- pela API REST automática do Supabase.
alter table projects enable row level security;
alter table respondents enable row level security;
alter table answers enable row level security;
`;

// Correções de dados rodadas a cada conexão (precisam poder rodar de novo sem efeito).
const FIXES = [
  // Até out/2026 o site gravava respostas codificadas duas vezes (um texto JSON dentro de uma string jsonb),
  // o que quebrava as páginas. Desfaz a dupla codificação; o que não for JSON válido fica como está.
  `do $$
   declare r record;
   begin
     for r in select respondent_id, question_id, value #>> '{}' as inner from answers
              where jsonb_typeof(value) = 'string' and left(value #>> '{}', 1) in ('[', '{', '"')
     loop
       begin
         update answers set value = r.inner::jsonb
         where respondent_id = r.respondent_id and question_id = r.question_id;
       exception when others then null;
       end;
     end loop;
   end $$`,
];

// URL do banco. POSTGRES_URL é a variável que a integração Supabase ↔ Vercel cria sozinha.
// Sem nenhuma das duas, sobe um Postgres embutido (PGlite) gravando em .data/, só para rodar localmente.
async function databaseUrl() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (url) return url;

  const [{ PGlite }, { PGLiteSocketServer }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("@electric-sql/pglite-socket"),
  ]);
  const dir = path.join(process.cwd(), ".data", "pglite");
  await mkdir(dir, { recursive: true });
  const server = new PGLiteSocketServer({ db: await PGlite.create(dir), port: 0, maxConnections: 5 });
  await server.start();
  return `postgres://postgres@${server.getServerConn()}/postgres`;
}

// O app fala com o banco sempre pelo mesmo driver (postgres.js), local e publicado,
// para o que funciona no computador funcionar igual no site.
async function connect(): Promise<Sql> {
  const url = new URL(await databaseUrl());
  const local = ["localhost", "127.0.0.1"].includes(url.hostname);
  url.search = ""; // descarta parâmetros extras da URL (ex.: supa=base-pooler.x), que o driver mandaria ao servidor
  const sql = postgres(url.toString(), { prepare: false, max: 5, ssl: local ? false : "require" });

  // Um comando por vez: o pooler do Supabase (modo transação) não garante vários comandos numa chamada
  const statements = SCHEMA.replace(/--.*$/gm, "").split(";").map((s) => s.trim()).filter(Boolean);
  for (const statement of statements) await sql.unsafe(statement);
  for (const fix of FIXES) await sql.unsafe(fix);
  return sql;
}

const globalForDb = globalThis as unknown as { __quartDb?: Promise<Sql> };

function getSql(): Promise<Sql> {
  globalForDb.__quartDb ??= connect().catch((error) => {
    globalForDb.__quartDb = undefined; // permite tentar de novo na próxima requisição
    throw error;
  });
  return globalForDb.__quartDb;
}

export async function query<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  const sql = await getSql();
  return (await sql.unsafe(text, params as never[])) as unknown as T[];
}
