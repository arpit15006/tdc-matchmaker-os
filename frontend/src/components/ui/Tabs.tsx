import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  layoutId?: string;
}

export function Tabs({ tabs, active, onChange, layoutId = 'tab-underline' }: TabsProps) {
  return (
    // Outer wrapper scrolls horizontally when the tabs are wider than the
    // viewport (phones); `pb-px` absorbs the active underline's 1px overhang so
    // it never triggers a vertical scrollbar. On desktop the tabs fit, so
    // nothing scrolls and the rendering is unchanged.
    <div className="overflow-x-auto scrollbar-hide pb-px">
      <div role="tablist" className="flex w-max min-w-full gap-1 border-b border-line">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors cursor-pointer',
                isActive ? 'text-ink' : 'text-ink-muted hover:text-ink-soft'
              )}
            >
              {tab.icon}
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gold"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
