"use client";

import { useRef, useState } from "react";
import type { FileRef, FilesQuestion, FilesValue } from "@/content/types";
import { AutoTextarea } from "./fields";
import type { StorageMode } from "./QuestionInput";

const MAX_BYTES = 50 * 1024 * 1024;

const fmtSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function uploadFile(file: File, token: string, mode: StorageMode): Promise<FileRef> {
  if (mode === "blob") {
    const { upload } = await import("@vercel/blob/client");
    const safe = file.name.normalize("NFD").replace(/[^\w.-]+/g, "-");
    const blob = await upload(`prework/${safe}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      clientPayload: token,
    });
    return { url: blob.url, name: file.name, size: file.size, type: file.type };
  }
  const form = new FormData();
  form.append("token", token);
  form.append("file", file);
  const res = await fetch("/api/upload/local", { method: "POST", body: form });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Falha no envio");
  return res.json();
}

export function FilesInput({
  question,
  value,
  onChange,
  token,
  storageMode,
}: {
  question: FilesQuestion;
  value: FilesValue | undefined;
  onChange: (v: FilesValue) => void;
  token: string;
  storageMode: StorageMode;
}) {
  const v: FilesValue = value ?? { files: [] };
  const files = v.files ?? [];
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const [over, setOver] = useState(false);
  // Os envios terminam em momentos diferentes; esta ref guarda a lista mais recente
  const latest = useRef(v);
  latest.current = v;

  async function handle(list: FileList | null) {
    if (!list?.length) return;
    setError(undefined);
    for (const file of Array.from(list)) {
      if (file.size > MAX_BYTES) {
        setError(`“${file.name}” passa de 50 MB. Envie por link (Drive, WeTransfer…).`);
        continue;
      }
      setUploading((u) => [...u, file.name]);
      try {
        const ref = await uploadFile(file, token, storageMode);
        const current = latest.current;
        const next = { ...current, files: [...(current.files ?? []), ref] };
        latest.current = next;
        onChange(next);
      } catch {
        setError(`Não conseguimos enviar “${file.name}”. Tente de novo.`);
      } finally {
        setUploading((u) => u.filter((n) => n !== file.name));
      }
    }
  }

  return (
    <div className="stack" style={{ "--gap": "18px" } as React.CSSProperties}>
      <div
        className="dropzone"
        role="button"
        tabIndex={0}
        data-over={over}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          handle(e.dataTransfer.files);
        }}
      >
        <UploadIcon />
        <span className="label-lg">Arraste arquivos aqui</span>
        <span className="small muted">ou clique para escolher · até 50 MB por arquivo</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            handle(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {(files.length > 0 || uploading.length > 0) && (
        <div>
          {files.map((f, i) => (
            <div key={f.url} className="file-row">
              <span className="name">
                <a href={f.url} target="_blank" rel="noreferrer" style={{ color: "var(--cream)" }}>
                  {f.name}
                </a>
              </span>
              <span className="muted tiny">{fmtSize(f.size)}</span>
              <button
                type="button"
                className="pill pill-ghost pill-sm"
                onClick={() => onChange({ ...v, files: files.filter((_, j) => j !== i) })}
              >
                Remover
              </button>
            </div>
          ))}
          {uploading.map((name) => (
            <div key={name} className="file-row" aria-live="polite">
              <span className="name muted">{name}</span>
              <span className="status">Enviando…</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {question.links && (
        <label className="field">
          <span className="field-label">Links</span>
          <span className="field-hint">Pastas no Drive, Dropbox, perfis, sites. Um por linha.</span>
          <AutoTextarea
            value={v.links ?? ""}
            onChange={(t) => onChange({ ...v, links: t })}
            placeholder="https://"
            minRows={3}
          />
        </label>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: "var(--ash)" }}>
      <path
        d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
