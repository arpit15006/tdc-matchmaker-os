import type { FunnelStage } from '@/types';

type Tone = 'neutral' | 'rose' | 'gold' | 'sage' | 'plum';

export const STAGE_LABELS: Record<FunnelStage, string> = {
  PROFILE_REVIEW: 'Profile Review',
  VERIFIED: 'Verified',
  ACTIVE_SEARCH: 'Active Search',
  POTENTIAL_MATCH_FOUND: 'Potential Match Found',
  INTRODUCTION_SENT: 'Introduction Sent',
  FIRST_CALL_SCHEDULED: 'First Call Scheduled',
  DATING: 'Dating',
  RELATIONSHIP: 'Relationship',
  ENGAGED: 'Engaged',
  MARRIED: 'Married',
};

/** Tone progression: rose (early) → gold (mid) → sage (success). */
export const STAGE_TONE: Record<FunnelStage, Tone> = {
  PROFILE_REVIEW: 'neutral',
  VERIFIED: 'rose',
  ACTIVE_SEARCH: 'rose',
  POTENTIAL_MATCH_FOUND: 'gold',
  INTRODUCTION_SENT: 'gold',
  FIRST_CALL_SCHEDULED: 'gold',
  DATING: 'sage',
  RELATIONSHIP: 'sage',
  ENGAGED: 'sage',
  MARRIED: 'sage',
};

export const FUNNEL_ORDER: FunnelStage[] = [
  'PROFILE_REVIEW',
  'VERIFIED',
  'ACTIVE_SEARCH',
  'POTENTIAL_MATCH_FOUND',
  'INTRODUCTION_SENT',
  'FIRST_CALL_SCHEDULED',
  'DATING',
  'RELATIONSHIP',
  'ENGAGED',
  'MARRIED',
];

export const STAGE_OPTIONS = FUNNEL_ORDER.map((s) => ({ value: s, label: STAGE_LABELS[s] }));
