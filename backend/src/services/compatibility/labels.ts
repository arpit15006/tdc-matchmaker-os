import type { Dimension } from './types';

/** Human-friendly strength phrasings, keyed by dimension. */
export const STRENGTH_LABELS: Record<Dimension, string> = {
  age: 'Well-aligned ages',
  location: 'Close in location',
  religion: 'Shared religious background',
  language: 'Common languages',
  education: 'Comparable education',
  profession: 'Compatible careers',
  family: 'Aligned family values',
  lifestyle: 'Similar lifestyles',
  children: 'Aligned on children',
  relocation: 'Flexible on relocation',
  pet: 'Aligned on pets',
  values: 'Shared core values',
};

/** Human-friendly concern phrasings, keyed by dimension. */
export const CONCERN_LABELS: Record<Dimension, string> = {
  age: 'Age gap to discuss',
  location: 'Living in different cities',
  religion: 'Differing religious backgrounds',
  language: 'Few shared languages',
  education: 'Education mismatch',
  profession: 'Career/income differences',
  family: 'Differing family expectations',
  lifestyle: 'Lifestyle differences',
  children: 'Differing views on children',
  relocation: 'Relocation may be a hurdle',
  pet: 'Differing views on pets',
  values: 'Some values differ',
};
