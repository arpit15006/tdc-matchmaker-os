import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  firstName: string;
  lastName: string;
  gender?: 'MALE' | 'FEMALE';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-xl',
};

export function Avatar({ firstName, lastName, gender, size = 'md', className }: AvatarProps) {
  const init = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  return (
    <div
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-serif font-semibold select-none',
        'ring-1 ring-inset',
        gender === 'MALE'
          ? 'bg-gold-soft text-[#7E5D26] ring-gold/40'
          : 'bg-rose-soft text-[#8F4F57] ring-rose/40',
        sizes[size],
        className
      )}
    >
      {init}
    </div>
  );
}
