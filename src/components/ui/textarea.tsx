import { type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxChars?: number;
  showCount?: boolean;
}

export function Textarea({ className, maxChars, showCount, value, ...props }: TextareaProps) {
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="relative">
      <textarea
        className={cn(
          'w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] leading-[1.8] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y',
          className,
        )}
        value={value}
        maxLength={maxChars}
        {...props}
      />
      {showCount && (
        <span className="absolute bottom-3 right-3 text-xs text-text-muted">
          {charCount}
          {maxChars ? ` / ${maxChars}` : ''}
        </span>
      )}
    </div>
  );
}
