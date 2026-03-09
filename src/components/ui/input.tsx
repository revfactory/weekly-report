import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
}

export function Input({ className, label, error, description, icon, rightElement, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        )}
        <input
          className={cn(
            'h-10 w-full rounded-md border bg-background px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors',
            icon ? 'pl-10' : false,
            rightElement ? 'pr-10' : false,
            error ? 'border-danger focus:ring-danger/40' : 'border-border',
            className,
          )}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </div>
      {description && !error && (
        <p className="mt-1 text-xs text-text-muted">{description}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
    </div>
  );
}
