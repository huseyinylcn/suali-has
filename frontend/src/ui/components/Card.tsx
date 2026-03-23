import React from 'react';
import { cn } from '../utils/cn';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps) {
  return (
    <div
      className={cn('border-b border-[var(--gh-border)] p-4 md:p-5', className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: DivProps) {
  return <div className={cn('p-4 md:p-5', className)} {...props} />;
}

