export const DIMENSIONS = [
  'age',
  'location',
  'religion',
  'language',
  'education',
  'profession',
  'family',
  'lifestyle',
  'children',
  'relocation',
  'pet',
  'values',
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

/** Per-dimension score map, each value 0..100. */
export type Breakdown = Record<Dimension, number>;

export interface CompatibilityResult {
  overallScore: number; // 0..100, rounded
  breakdown: Breakdown;
  strengths: string[]; // human labels, top dims >= STRENGTH_THRESHOLD
  concerns: string[]; // human labels, dims < CONCERN_THRESHOLD
  strengthDimensions: Dimension[];
  concernDimensions: Dimension[];
}

export const STRENGTH_THRESHOLD = 80;
export const CONCERN_THRESHOLD = 50;
export const MAX_STRENGTHS = 4;
export const MAX_CONCERNS = 4;
