import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { STAGE_TONE } from '@/lib/stages';
import { colors } from '@/theme/tokens';
import type { FunnelStageCount } from '@/types';

// Tone → [barFrom, barTo] gradient.
const TONE_GRAD: Record<string, [string, string]> = {
  neutral: [colors.inkMuted, colors.line],
  rose: [colors.roseDeep, colors.rose],
  gold: [colors.goldDeep, colors.gold],
  sage: [colors.sageDeep, colors.sage],
  plum: [colors.ink, colors.inkSoft],
};

export function FunnelChart({ stages }: { stages: FunnelStageCount[] }) {
  const navigate = useNavigate();
  const max = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const widthPct = Math.max(5, (s.count / max) * 100);
        const prev = stages[i - 1];
        const conversion = prev && prev.count > 0 ? Math.round((s.count / prev.count) * 100) : null;
        const [from, to] = TONE_GRAD[STAGE_TONE[s.stage]] ?? TONE_GRAD.plum;

        return (
          <button
            key={s.stage}
            onClick={() => navigate(`/customers?stage=${s.stage}`)}
            className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-1 py-0.5 text-left transition-colors hover:bg-rose-soft/15"
            title={`View ${s.label} clients`}
          >
            {/* Stage index marker */}
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              {i + 1}
            </span>
            <span className="w-32 shrink-0 truncate text-sm text-ink-soft group-hover:text-ink">
              {s.label}
            </span>
            <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-line/35">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-lg"
                style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-ink/85">
                {s.count}
              </span>
            </div>
            <span className="w-12 shrink-0 text-right text-xs font-medium text-ink-muted">
              {conversion != null ? `${conversion}%` : '—'}
            </span>
          </button>
        );
      })}
      <div className="flex items-center justify-end gap-1.5 pt-2 text-xs text-ink-muted">
        <span className="inline-block h-2 w-2 rounded-full bg-rose" /> early
        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-gold" /> mid
        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-sage" /> committed
        <span className="ml-3">· right column = conversion from prior stage</span>
      </div>
    </div>
  );
}
