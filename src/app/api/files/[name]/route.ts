import { readFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR, contentTypeFor, isSafeStoredName } from "@/lib/localFiles";

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!isSafeStoredName(name)) return new Response("Não encontrado", { status: 404 });

  const data = await readFile(path.join(UPLOAD_DIR, name)).catch(() => null);
  if (!data) return new Response("Não encontrado", { status: 404 });

  const original = new URL(request.url).searchParams.get("name") ?? name;
  return new Response(data, {
    headers: {
      "content-type": contentTypeFor(name),
      "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(original)}`,
      // Arquivo enviado por terceiros: nunca executa scripts no nosso domínio
      "content-security-policy": "sandbox",
      "x-content-type-options": "nosniff",
    },
  });
}
