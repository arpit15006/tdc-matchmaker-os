import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { LineSkeleton } from '@/components/feedback/Skeletons';
import { apiErrorMessage } from '@/lib/api/axios';
import { cn } from '@/lib/utils/cn';
import { useMatchExplanation } from '../api/workbenchApi';

export function WhyThisMatch({ matchId, cached }: { matchId: string; cached?: string | null }) {
  const [open, setOpen] = useState(false);
  const explanation = useMatchExplanation();
  const text = explanation.data?.explanation ?? cached ?? null;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !text && !explanation.isPending) explanation.mutate(matchId);
  };

  return (
    <div className="rounded-2xl border border-line bg-background/50">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <Sparkles className="h-4 w-4 text-gold-deep" />
          Why this match
        </span>
        <ChevronDown
          className={cn('h-4 w-4 text-ink-muted transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {explanation.isPending ? (
                <LineSkeleton lines={4} />
              ) : explanation.isError ? (
                <p className="text-sm text-rose-deep">
                  {apiErrorMessage(explanation.error, 'Could not generate explanation.')}
                </p>
              ) : text ? (
                <p className="whitespace-pre-line font-sans text-[15px] leading-7 text-ink-soft">
                  {text}
                </p>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
