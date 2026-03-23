import React, { useId, useMemo, useRef } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from './Button';

export function FilePicker({
  accept,
  disabled,
  onFileSelected,
  label = 'Dosya seç',
  helperText,
  valueLabel
}: {
  accept?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  valueLabel?: string;
  onFileSelected: (file?: File) => void;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const display = useMemo(() => valueLabel ?? 'Seçilmedi', [valueLabel]);

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => onFileSelected(e.target.files?.[0])}
      />

      <div
        className={cn(
          'flex items-center gap-2 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-2 py-1.5',
          disabled && 'opacity-60'
        )}
      >
        <Button
          type="button"
          variant="secondary"
          className="h-8 px-2 text-xs"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {label}
        </Button>

        <div className="min-w-0 flex-1">
          <div className="truncate text-xs text-[var(--gh-fg)]">{display}</div>
          {helperText ? (
            <div className="truncate text-[11px] text-[var(--gh-fg-muted)]">{helperText}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

