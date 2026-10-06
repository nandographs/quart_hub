import "server-only";
import path from "node:path";

// Armazenamento de arquivos em disco, usado só quando não há Vercel Blob configurado (desenvolvimento local).
export const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".zip": "application/zip",
};

export const contentTypeFor = (name: string) => TYPES[path.extname(name).toLowerCase()] ?? "application/octet-stream";

/** Só aceita nomes gerados por nós: uuid + extensão simples. */
export const isSafeStoredName = (name: string) => /^[0-9a-f-]{36}(\.[a-z0-9]{1,8})?$/i.test(name);
