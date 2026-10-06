"use client";

import { useEffect, useRef } from "react";
import type { FieldDef } from "@/content/types";

export function AutoTextarea({
  value,
  onChange,
  minRows = 4,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  minRows?: number;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      className="textarea"
      rows={minRows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}

export function Field({
  def,
  value,
  onChange,
  autoFocus,
  compact,
}: {
  def: FieldDef;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  compact?: boolean;
}) {
  return (
    <label className="field">
      <span className="field-label">{def.label}</span>
      {def.hint && <span className="field-hint">{def.hint}</span>}
      {def.multiline ? (
        <AutoTextarea
          value={value}
          onChange={onChange}
          placeholder={def.placeholder}
          autoFocus={autoFocus}
          minRows={compact ? 3 : 4}
        />
      ) : (
        <input
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.placeholder}
          autoFocus={autoFocus}
        />
      )}
    </label>
  );
}
