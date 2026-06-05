import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { MatchScoreRing } from '@/components/data-display/MatchScoreRing';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { CardSkeleton } from '@/components/feedback/Skeletons';
import { apiErrorMessage } from '@/lib/api/axios';
import type { MatchStatus, QueueData, QueueItem } from '@/types';
import { useAdvanceQueueItem, useQueue } from '../api/useQueue';

interface Accent {
  dot: string;
  badge: string;
  card: string;
}

const ACCENTS: Record<string, Accent> = {
  NEW: { dot: 'bg-sage', badge: 'bg-sage-soft/70 text-sage-deep', card: 'border-l-sage' },
  WAITING_REVIEW: { dot: 'bg-gold', badge: 'bg-gold-soft/70 text-gold-deep', card: 'border-l-gold' },
  SENT: { dot: 'bg-rose', badge: 'bg-rose-soft/70 text-rose-deep', card: 'border-l-rose' },
  AWAITING_FEEDBACK: { dot: 'bg-ink/50', badge: 'bg-ink/12 text-ink', card: 'border-l-ink/40' },
};

const COLUMNS: {
  key: keyof QueueData;
  title: string;
  next?: MatchStatus;
  nextLabel?: string;
}[] = [
  { key: 'NEW', title: 'New Recommendations', next: 'WAITING_REVIEW', nextLabel: 'Review' },
  { key: 'WAITING_REVIEW', title: 'Waiting for Review', next: 'SENT', nextLabel: 'Send' },
  { key: 'SENT', title: 'Sent', next: 'AWAITING_FEEDBACK', nextLabel: 'Awaiting' },
  { key: 'AWAITING_FEEDBACK', title: 'Awaiting Feedback' },
];

function Column({
  columnKey,
  title,
  items,
  next,
  nextLabel,
  onAdvance,
}: {
  columnKey: keyof QueueData;
  title: string;
  items: QueueItem[];
  next?: MatchStatus;
  nextLabel?: string;
  onAdvance: (item: QueueItem, status: MatchStatus) => void;
}) {
  const navigate = useNavigate();
  const accent = ACCENTS[columnKey];
  return (
    <div className="flex min-w-[280px] flex-1 flex-col rounded-3xl border border-line bg-surface/60 p-4 max-h-[calc(100vh-16rem)] overflow-hidden">
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${accent.dot}`} />
          <h3 className="font-serif text-base text-ink">{title}</h3>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${accent.badge}`}>
          {items.length}
        </span>
      </div>
      <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-10 text-center text-ink-muted">
            <CheckCircle2 className="mb-2 h-5 w-5 text-sage" />
            <span className="text-xs">All caught up</span>
          </div>
        ) : (
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`rounded-2xl border border-l-[3px] border-line bg-surface p-4 shadow-soft transition-shadow duration-200 hover:shadow-float ${accent.card}`}
              >
                <div className="flex items-start gap-3">
                  <MatchScoreRing score={item.overallScore} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {item.candidate.firstName} {item.candidate.lastName}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      for {item.client.firstName} {item.client.lastName}
                    </p>
                  </div>
                  <Avatar
                    firstName={item.client.firstName}
                    lastName={item.client.lastName}
                    gender={item.client.gender}
                    size="sm"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={next ? 'px-3' : 'flex-1'}
                    onClick={() => navigate(`/customers/${item.client.id}?tab=matches`)}
                  >
                    Open
                  </Button>
                  {next && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 whitespace-nowrap"
                      rightIcon={<ArrowRight className="h-3.5 w-3.5 shrink-0" />}
                      onClick={() => onAdvance(item, next)}
                    >
                      {nextLabel}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export function QueuePage() {
  const { data, isLoading, isError, refetch } = useQueue();
  const advance = useAdvanceQueueItem();
  const { toast } = useToast();

  const onAdvance = (item: QueueItem, status: MatchStatus) => {
    advance.mutate(
      { matchId: item.id, status },
      {
        onSuccess: () => toast('Match moved', 'success'),
        onError: (e) => toast(apiErrorMessage(e), 'error'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workflow"
        title="Pending Match Queue"
        subtitle="Move recommendations from review to introduction and feedback."
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <div className="grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="scrollbar-hide flex items-start gap-4 overflow-x-auto pb-2">
          {COLUMNS.map((col) => (
            <Column
              key={col.key}
              columnKey={col.key}
              title={col.title}
              items={data[col.key]}
              next={col.next}
              nextLabel={col.nextLabel}
              onAdvance={onAdvance}
            />
          ))}
        </div>
      )}
    </div>
  );
}
