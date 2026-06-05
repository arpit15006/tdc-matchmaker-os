import { ProgressRing } from '@/components/ui/ProgressRing';
import { scoreBand, scoreColor, scoreGradient } from '@/theme/tokens';

interface MatchScoreRingProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

const BAND_LABEL: Record<string, string> = {
  excellent: 'Excellent',
  strong: 'Strong',
  moderate: 'Moderate',
};

export function MatchScoreRing({ score, size = 72, showLabel = false }: MatchScoreRingProps) {
  const color = scoreColor(score);
  const band = scoreBand(score);
  const compact = size < 60;

  return (
    <div className="flex flex-col items-center">
      <ProgressRing value={score} size={size} stroke={compact ? 5 : 7} gradient={scoreGradient(score)}>
        {compact ? (
          <span className="font-serif text-sm font-semibold text-ink">{score}</span>
        ) : (
          <div className="text-center leading-none">
            <span className="font-serif text-lg font-semibold text-ink">{score}</span>
            <span className="mt-0.5 block text-[9px] uppercase tracking-wide text-ink-muted">/ 100</span>
          </div>
        )}
      </ProgressRing>
      {showLabel && (
        <span className="mt-1.5 text-xs font-medium" style={{ color }}>
          {BAND_LABEL[band]}
        </span>
      )}
    </div>
  );
}
