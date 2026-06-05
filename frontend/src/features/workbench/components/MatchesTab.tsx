import { motion } from 'framer-motion';
import { Heart, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { CardSkeleton } from '@/components/feedback/Skeletons';
import { staggerContainer } from '@/lib/motion/variants';
import type { Match } from '@/types';
import { useGenerateMatches, useMatches } from '../api/workbenchApi';
import { FeedbackModal } from './FeedbackModal';
import { MatchCard } from './MatchCard';
import { SendMatchModal } from './SendMatchModal';

export function MatchesTab({ customerId }: { customerId: string }) {
  const matches = useMatches(customerId);
  const generate = useGenerateMatches(customerId);
  const [sendMatch, setSendMatch] = useState<Match | null>(null);
  const [feedbackMatch, setFeedbackMatch] = useState<Match | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {matches.data?.length
            ? `Top ${matches.data.length} recommended matches, ranked by compatibility`
            : 'Recommended matches'}
        </p>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          loading={generate.isPending}
          onClick={() => generate.mutate()}
        >
          {matches.data?.length ? 'Regenerate' : 'Generate Matches'}
        </Button>
      </div>

      {matches.isError ? (
        <ErrorState onRetry={() => matches.refetch()} />
      ) : matches.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !matches.data?.length ? (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="No recommendations yet"
          description="Generate a fresh set of curated matches from the eligible pool."
          action={
            <Button loading={generate.isPending} onClick={() => generate.mutate()}>
              Generate Matches
            </Button>
          }
        />
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
          {matches.data.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              onSendMatch={setSendMatch}
              onFeedback={setFeedbackMatch}
            />
          ))}
        </motion.div>
      )}

      <SendMatchModal
        customerId={customerId}
        match={sendMatch}
        open={Boolean(sendMatch)}
        onClose={() => setSendMatch(null)}
      />
      <FeedbackModal
        customerId={customerId}
        match={feedbackMatch}
        open={Boolean(feedbackMatch)}
        onClose={() => setFeedbackMatch(null)}
      />
    </div>
  );
}
