import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  // Gold is the premium CTA.
  primary:
    'bg-gold text-white hover:bg-gold-deep shadow-soft hover:shadow-card disabled:bg-gold/50',
  secondary:
    'bg-surface text-ink border border-line hover:border-rose hover:text-rose-deep',
  ghost: 'bg-transparent text-ink-soft hover:bg-rose-soft/50 hover:text-ink',
  subtle: 'bg-rose-soft/60 text-rose-deep hover:bg-rose-soft',
  danger: 'bg-surface text-rose-deep border border-rose/40 hover:bg-rose-soft/40',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl font-medium',
        'transition-all duration-200 ease-editorial cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
);
Button.displayName = 'Button';
