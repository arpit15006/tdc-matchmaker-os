import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  layoutId?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  layoutId = 'segment',
}: SegmentedControlProps) {
  return (
    <div className="inline-flex rounded-2xl bg-rose-soft/40 p-1">
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
              isActive ? 'text-ink' : 'text-ink-muted hover:text-ink-soft'
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-surface shadow-soft"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
