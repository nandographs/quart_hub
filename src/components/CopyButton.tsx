"use client";

import { useState } from "react";

export function CopyButton({ text, className = "pill pill-primary pill-sm" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
    >
      {copied ? "Copiado" : "Copiar link"}
    </button>
  );
}
