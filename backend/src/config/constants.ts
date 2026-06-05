import { FunnelStage } from '@prisma/client';

/** The funnel stages in canonical journey order. */
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

/** Human-friendly labels for funnel stages. */
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

/** Stages considered an "active search" for KPI purposes. */
export const ACTIVE_STAGES: FunnelStage[] = [
  'ACTIVE_SEARCH',
  'POTENTIAL_MATCH_FOUND',
  'INTRODUCTION_SENT',
  'FIRST_CALL_SCHEDULED',
  'DATING',
];

/** Stages that count as a relationship outcome (success). */
export const SUCCESS_STAGES: FunnelStage[] = [
  'RELATIONSHIP',
  'ENGAGED',
  'MARRIED',
];

/** Stages at or beyond which an introduction has been sent (success-rate denominator). */
export const POST_INTRO_STAGES: FunnelStage[] = [
  'INTRODUCTION_SENT',
  'FIRST_CALL_SCHEDULED',
  'DATING',
  'RELATIONSHIP',
  'ENGAGED',
  'MARRIED',
];

/** Index of a stage in the funnel order (for comparisons). */
export function stageIndex(stage: FunnelStage): number {
  return FUNNEL_ORDER.indexOf(stage);
}
