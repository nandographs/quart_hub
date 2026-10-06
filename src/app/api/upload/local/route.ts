import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FileRef } from "@/content/types";
import { getRespondentByToken } from "@/lib/repo";
import { UPLOAD_DIR } from "@/lib/localFiles";

const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "Use o upload pelo Vercel Blob" }, { status: 400 });
  }
  const form = await request.formData();
  const token = form.get("token");
  const file = form.get("file");
  if (typeof token !== "string" || !(file instanceof File)) {
    return Response.json({ error: "Requisição inválida" }, { status: 400 });
  }
  if (!(await getRespondentByToken(token))) return Response.json({ error: "Link inválido" }, { status: 404 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Arquivo acima de 50 MB" }, { status: 413 });

  const ext = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 9);
  const stored = `${randomUUID()}${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, stored), Buffer.from(await file.arrayBuffer()));

  const ref: FileRef = {
    url: `/api/files/${stored}?name=${encodeURIComponent(file.name)}`,
    name: file.name,
    size: file.size,
    type: file.type,
  };
  return Response.json(ref);
}
