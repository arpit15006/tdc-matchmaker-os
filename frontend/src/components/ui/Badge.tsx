import { cn } from '@/lib/utils/cn';

type Tone = 'neutral' | 'rose' | 'gold' | 'sage' | 'plum';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: React.ReactNode;
}

const tones: Record<Tone, string> = {
  neutral: 'bg-line/60 text-ink-soft',
  rose: 'bg-rose-soft/70 text-rose-deep',
  gold: 'bg-gold-soft/70 text-gold-deep',
  sage: 'bg-sage-soft/70 text-sage-deep',
  plum: 'bg-ink/8 text-ink',
};

export function Badge({ className, tone = 'neutral', icon, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        tones[tone],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
