import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const taId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={taId} className="mb-1.5 block text-sm font-medium text-ink-soft">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={taId}
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            'w-full rounded-2xl border bg-surface px-4 py-3 text-sm text-ink',
            'placeholder:text-ink-muted transition-colors duration-200 resize-y',
            'focus:border-rose focus:outline-none',
            error ? 'border-rose-deep' : 'border-line',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-rose-deep">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
