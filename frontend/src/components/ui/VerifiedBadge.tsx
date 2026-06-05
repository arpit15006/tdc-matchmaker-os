import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface VerifiedBadgeProps {
  verified: boolean;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function VerifiedBadge({ verified, size = 'sm', showLabel = true, className }: VerifiedBadgeProps) {
  if (!verified) {
    return showLabel ? (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full bg-line/60 px-2.5 py-0.5 text-ink-muted',
          size === 'sm' ? 'text-xs' : 'text-sm',
          className
        )}
      >
        Unverified
      </span>
    ) : null;
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-sage-soft/70 px-2.5 py-0.5 font-medium text-sage-deep',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className
      )}
      title="Email and phone verified"
    >
      <BadgeCheck className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />
      {showLabel && 'Verified'}
      <span className="sr-only">Verified profile</span>
    </span>
  );
}
