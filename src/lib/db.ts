import "server-only";
import { mkdir } from "node:fs/promises";
import path from "node:path";

type Row = Record<string, unknown>;
type Driver = {
  query: (text: string, params?: unknown[]) => Promise<Row[]>;
  exec: (text: string) => Promise<void>;
};

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

async function createDriver(): Promise<Driver> {
  // POSTGRES_URL é a variável que a integração Supabase ↔ Vercel cria sozinha
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (url) {
    const { default: postgres } = await import("postgres");
    // Descarta parâmetros extras da URL (ex.: supa=base-pooler.x), que o driver mandaria ao servidor
    const clean = new URL(url);
    const local = ["localhost", "127.0.0.1"].includes(clean.hostname);
    clean.search = "";
    const sql = postgres(clean.toString(), { prepare: false, max: 5, ssl: local ? false : "require" });
    return {
      query: async (text, params = []) =>
        (await sql.unsafe(text, params as never[])) as unknown as Row[],
      exec: async (text) => {
        await sql.unsafe(text);
      },
    };
  }

  // Sem DATABASE_URL: Postgres embutido (PGlite) gravando em .data/, para rodar localmente.
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = path.join(process.cwd(), ".data", "pglite");
  await mkdir(dir, { recursive: true });
  const pg = new PGlite(dir);
  return {
    query: async (text, params = []) => (await pg.query<Row>(text, params)).rows,
    exec: async (text) => {
      await pg.exec(text);
    },
  };
}

const globalForDb = globalThis as unknown as { __quartDb?: Promise<Driver> };

function getDriver(): Promise<Driver> {
  globalForDb.__quartDb ??= createDriver()
    .then(async (driver) => {
      // Um comando por vez: o pooler do Supabase (modo transação) não garante vários comandos numa chamada
      const statements = SCHEMA.replace(/--.*$/gm, "").split(";").map((s) => s.trim()).filter(Boolean);
      for (const statement of statements) await driver.exec(statement);
      return driver;
    })
    .catch((error) => {
      globalForDb.__quartDb = undefined; // permite tentar de novo na próxima requisição
      throw error;
    });
  return globalForDb.__quartDb;
}

export async function query<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  const driver = await getDriver();
  return (await driver.query(text, params)) as T[];
}
