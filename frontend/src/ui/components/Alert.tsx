import React from 'react';
import { cn } from '../utils/cn';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

const iconByVariant: Record<AlertVariant, React.ReactNode> = {
  info: <Info className="h-4 w-4" />,
  success: <CircleCheck className="h-4 w-4" />,
  warning: <TriangleAlert className="h-4 w-4" />,
  danger: <CircleAlert className="h-4 w-4" />
};

export function Alert({
  title,
  description,
  variant = 'info',
  className
}: {
  title: string;
  description?: string;
  variant?: AlertVariant;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-md border p-3 text-sm',
        variant === 'info' && 'border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] text-[var(--gh-fg)]',
        variant === 'success' && 'border-[color:var(--gh-success)]/30 bg-[color:var(--gh-success)]/10 text-[var(--gh-fg)]',
        variant === 'warning' && 'border-[color:var(--gh-attention)]/35 bg-[color:var(--gh-attention)]/10 text-[var(--gh-fg)]',
        variant === 'danger' && 'border-[color:var(--gh-danger)]/35 bg-[color:var(--gh-danger)]/10 text-[var(--gh-fg)]',
        className
      )}
    >
      <div className="mt-0.5 shrink-0">{iconByVariant[variant]}</div>
      <div className="min-w-0">
        <div className="font-semibold">{title}</div>
        {description ? <div className="mt-0.5 text-xs text-[var(--gh-fg-muted)]">{description}</div> : null}
      </div>
    </div>
  );
}

