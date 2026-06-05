import type { Customer } from '@prisma/client';
import { CONCERN_LABELS, STRENGTH_LABELS } from './labels';
import {
  clamp,
  heightModifier,
  scoreAge,
  scoreChildren,
  scoreEducation,
  scoreFamily,
  scoreLanguage,
  scoreLifestyle,
  scoreLocation,
  scorePet,
  scoreProfession,
  scoreRelocation,
  scoreReligion,
  scoreValues,
} from './scorers';
import {
  CONCERN_THRESHOLD,
  DIMENSIONS,
  MAX_CONCERNS,
  MAX_STRENGTHS,
  STRENGTH_THRESHOLD,
  type Breakdown,
  type CompatibilityResult,
  type Dimension,
} from './types';
import { weightsFor } from './weights';

/**
 * Compute the full, deterministic compatibility breakdown between a client and
 * a candidate. Pure function: identical inputs always yield identical output.
 */
export function scoreCompatibility(
  client: Customer,
  candidate: Customer
): CompatibilityResult {
  const breakdown: Breakdown = {
    age: clamp(scoreAge(client, candidate) + heightModifier(client, candidate)),
    location: scoreLocation(client, candidate),
    religion: scoreReligion(client, candidate),
    language: scoreLanguage(client, candidate),
    education: scoreEducation(client, candidate),
    profession: scoreProfession(client, candidate),
    family: scoreFamily(client, candidate),
    lifestyle: scoreLifestyle(client, candidate),
    children: scoreChildren(client, candidate),
    relocation: scoreRelocation(client, candidate),
    pet: scorePet(client, candidate),
    values: scoreValues(client, candidate),
  };

  // Round each dimension for clean storage/display.
  for (const d of DIMENSIONS) breakdown[d] = Math.round(breakdown[d]);

  const weights = weightsFor(client.gender);
  let weighted = 0;
  for (const d of DIMENSIONS) weighted += breakdown[d] * weights[d];
  const overallScore = Math.round(clamp(weighted));

  // Strengths: dims >= threshold, sorted by score desc, tie-break by fixed order.
  const ordered = [...DIMENSIONS].sort((a, b) => {
    if (breakdown[b] !== breakdown[a]) return breakdown[b] - breakdown[a];
    return DIMENSIONS.indexOf(a) - DIMENSIONS.indexOf(b);
  });

  const strengthDimensions = ordered
    .filter((d) => breakdown[d] >= STRENGTH_THRESHOLD)
    .slice(0, MAX_STRENGTHS);

  const concernDimensions = [...DIMENSIONS]
    .filter((d) => breakdown[d] < CONCERN_THRESHOLD)
    .sort((a, b) => {
      if (breakdown[a] !== breakdown[b]) return breakdown[a] - breakdown[b];
      return DIMENSIONS.indexOf(a) - DIMENSIONS.indexOf(b);
    })
    .slice(0, MAX_CONCERNS);

  return {
    overallScore,
    breakdown,
    strengths: strengthDimensions.map((d) => STRENGTH_LABELS[d]),
    concerns: concernDimensions.map((d) => CONCERN_LABELS[d]),
    strengthDimensions,
    concernDimensions,
  };
}

export type { Breakdown, CompatibilityResult, Dimension };
