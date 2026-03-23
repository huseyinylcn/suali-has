import React from 'react';
import { cn } from '../utils/cn';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full resize-y rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-3 py-2 text-sm text-[var(--gh-fg)] outline-none placeholder:text-[var(--gh-fg-muted)] focus:ring-2 focus:ring-[var(--gh-accent)] disabled:bg-[var(--gh-canvas-subtle)]',
        className
      )}
      {...props}
    />
  );
}

