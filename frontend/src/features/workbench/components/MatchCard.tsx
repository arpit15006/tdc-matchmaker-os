import { motion } from 'framer-motion';
import { Check, Send, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { MatchScoreRing } from '@/components/data-display/MatchScoreRing';
import { humanize } from '@/lib/format';
import { staggerItem } from '@/lib/motion/variants';
import type { Match } from '@/types';
import { WhyThisMatch } from './WhyThisMatch';

const STATUS_TONE: Record<string, 'neutral' | 'rose' | 'gold' | 'sage'> = {
  NEW: 'neutral',
  WAITING_REVIEW: 'gold',
  SENT: 'rose',
  AWAITING_FEEDBACK: 'gold',
  ACCEPTED: 'sage',
  REJECTED: 'neutral',
  ON_HOLD: 'neutral',
};

interface MatchCardProps {
  match: Match;
  onSendMatch: (match: Match) => void;
  onFeedback: (match: Match) => void;
}

export function MatchCard({ match, onSendMatch, onFeedback }: MatchCardProps) {
  const c = match.candidate;
  const sent = match.status !== 'NEW' && match.status !== 'WAITING_REVIEW';

  return (
    <motion.div variants={staggerItem}>
      <Card>
        <div className="flex items-start gap-4">
          <Avatar firstName={c.firstName} lastName={c.lastName} gender={c.gender} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-ink">
                {c.firstName} {c.lastName}
              </h3>
              {c.verified && <VerifiedBadge verified showLabel={false} />}
              <Badge tone={STATUS_TONE[match.status]} className="ml-auto">
                {humanize(match.status)}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-ink-muted">
              {c.age} · {c.city} · {c.designation} · {c.religion}
            </p>
          </div>
          <MatchScoreRing score={match.overallScore} size={68} showLabel />
        </div>

        {/* Strengths & concerns */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-sage-deep">
              Key Similarities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {match.strengths.length ? (
                match.strengths.map((s) => (
                  <Badge key={s} tone="sage">
                    {s}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-ink-muted">—</span>
              )}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-rose-deep">
              Potential Concerns
            </p>
            <div className="flex flex-wrap gap-1.5">
              {match.concerns.length ? (
                match.concerns.map((s) => (
                  <Badge key={s} tone="rose">
                    {s}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-ink-muted">None notable</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <WhyThisMatch matchId={match.id} cached={match.aiExplanation} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button size="sm" leftIcon={<Send className="h-4 w-4" />} onClick={() => onSendMatch(match)}>
            {sent ? 'Resend / Introduce' : 'Generate Introduction'}
          </Button>
          {sent && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ThumbsUp className="h-4 w-4" />}
              onClick={() => onFeedback(match)}
            >
              Record Feedback
            </Button>
          )}
          {match.status === 'ACCEPTED' && (
            <span className="flex items-center gap-1 text-sm text-sage-deep">
              <Check className="h-4 w-4" /> Accepted
            </span>
          )}
          {match.status === 'REJECTED' && (
            <span className="flex items-center gap-1 text-sm text-ink-muted">
              <ThumbsDown className="h-4 w-4" /> Passed
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
