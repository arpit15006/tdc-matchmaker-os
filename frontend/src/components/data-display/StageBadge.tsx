import { Badge } from '@/components/ui/Badge';
import { STAGE_LABELS, STAGE_TONE } from '@/lib/stages';
import type { FunnelStage } from '@/types';

export function StageBadge({ stage }: { stage: FunnelStage }) {
  return <Badge tone={STAGE_TONE[stage]}>{STAGE_LABELS[stage]}</Badge>;
}
