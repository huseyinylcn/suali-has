import React from 'react';
import { cn } from '../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--gh-primary)] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' &&
          'border border-[color:var(--gh-primary)] bg-[color:var(--gh-primary)] text-white hover:brightness-95',
        variant === 'secondary' &&
          'border border-[var(--gh-border)] bg-[var(--gh-canvas)] text-[var(--gh-fg)] hover:bg-[var(--gh-canvas-subtle)]',
        variant === 'ghost' &&
          'border border-transparent bg-transparent text-[var(--gh-fg)] hover:bg-[var(--gh-canvas-subtle)]',
        variant === 'danger' &&
          'border border-transparent bg-[var(--gh-danger)] text-white hover:brightness-95',
        className
      )}
      {...props}
    />
  );
}

