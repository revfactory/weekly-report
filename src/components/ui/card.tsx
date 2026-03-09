import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  clickable?: boolean;
  hoverable?: boolean;
}

export function Card({ children, className, clickable, hoverable, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-background p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-150',
        (clickable || hoverable) && 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-px',
        clickable && 'cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
