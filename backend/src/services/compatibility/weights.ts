import type { Gender } from '@prisma/client';
import type { Dimension } from './types';

export type WeightTable = Record<Dimension, number>;

/**
 * Gender-specific dimension weights, keyed by the CLIENT's gender.
 * Each table sums to exactly 1.00 (verified by assertWeights at module load).
 *
 * Male client assignment requirements: candidate younger / shorter / lower
 * income / matching children preference, then lifestyle, religion, family
 * values, language, relocation. ("Shorter" is folded into the age scorer via
 * heightModifier; "lower income" dominates the profession scorer.)
 *
 * Female client assignment requirements: profession compatibility, values
 * compatibility, relocation compatibility, then education, lifestyle, family
 * expectations, long-term goals, children preference.
 */
const MALE_WEIGHTS: WeightTable = {
  age: 0.18,
  profession: 0.14,
  children: 0.12,
  lifestyle: 0.11,
  religion: 0.1,
  family: 0.1,
  language: 0.08,
  relocation: 0.06,
  values: 0.05,
  education: 0.03,
  location: 0.02,
  pet: 0.01,
};

const FEMALE_WEIGHTS: WeightTable = {
  profession: 0.16,
  values: 0.15,
  relocation: 0.12,
  education: 0.11,
  lifestyle: 0.1,
  family: 0.1,
  children: 0.09,
  religion: 0.07,
  age: 0.05,
  language: 0.03,
  location: 0.01,
  pet: 0.01,
};

export function weightsFor(clientGender: Gender): WeightTable {
  return clientGender === 'MALE' ? MALE_WEIGHTS : FEMALE_WEIGHTS;
}

/** Throws at module load if a weight table does not sum to ~1.00. */
function assertWeights(table: WeightTable, label: string) {
  const sum = Object.values(table).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1) > 1e-9) {
    throw new Error(`${label} weights must sum to 1.00 (got ${sum.toFixed(4)})`);
  }
}

assertWeights(MALE_WEIGHTS, 'MALE');
assertWeights(FEMALE_WEIGHTS, 'FEMALE');
