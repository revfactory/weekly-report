import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ className, children, label, ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      )}
      <select
        className={cn(
          'h-10 rounded-lg border border-border bg-background px-3 pr-8 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer appearance-none',
          'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E")] bg-[position:right_8px_center] bg-no-repeat',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
