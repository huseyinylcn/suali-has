import { cn } from '../utils/cn';

import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-9 w-full rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-3 text-sm text-[var(--gh-fg)] outline-none placeholder:text-[var(--gh-fg-muted)] focus:ring-2 focus:ring-[var(--gh-accent)] disabled:bg-[var(--gh-canvas-subtle)]',
        className
      )}
      {...props}
    />
  );
}

