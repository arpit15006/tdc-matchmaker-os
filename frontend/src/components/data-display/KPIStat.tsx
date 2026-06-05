import { motion } from 'framer-motion';
import { staggerItem } from '@/lib/motion/variants';
import { cn } from '@/lib/utils/cn';

type Accent = 'rose' | 'gold' | 'sage' | 'plum';

interface KPIStatProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: Accent;
  suffix?: string;
}

const iconAccents: Record<Accent, string> = {
  rose: 'bg-rose-soft/60 text-rose-deep',
  gold: 'bg-gold-soft/60 text-gold-deep',
  sage: 'bg-sage-soft/60 text-sage-deep',
  plum: 'bg-ink/8 text-ink',
};

const topBar: Record<Accent, string> = {
  rose: 'from-rose to-rose-soft',
  gold: 'from-gold to-gold-soft',
  sage: 'from-sage to-sage-soft',
  plum: 'from-ink/40 to-line',
};

export function KPIStat({ label, value, icon, accent = 'plum', suffix }: KPIStatProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-soft transition-shadow duration-200 hover:shadow-card"
    >
      {/* Accent top edge */}
      <span
        className={cn(
          'absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-70 transition-opacity group-hover:opacity-100',
          topBar[accent]
        )}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-muted">{label}</p>
          <p className="mt-2 font-serif text-3xl text-ink">
            {value}
            {suffix && <span className="ml-0.5 text-xl text-ink-soft">{suffix}</span>}
          </p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110',
            iconAccents[accent]
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
