import type { Customer } from '@prisma/client';
import { regionOf, sameRegion, sameState } from './geo';

// ─────────────────────────────────────────────────────────────────────
// Shared helpers (all pure, deterministic)
// ─────────────────────────────────────────────────────────────────────

const NEUTRAL = 50;

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/** Jaccard overlap of two string arrays as a 0..100 score. */
export function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a.map(norm).filter(Boolean));
  const setB = new Set(b.map(norm).filter(Boolean));
  if (setA.size === 0 && setB.size === 0) return NEUTRAL;
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const x of setA) if (setB.has(x)) intersection++;
  const union = new Set([...setA, ...setB]).size;
  return clamp((intersection / union) * 100);
}

export function ageFromDob(dob: Date): number {
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const m = now.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) age--;
  return age;
}

// ── Religion adjacency ────────────────────────────────────────────────
// Mutually compatible religions get a partial score on mismatch.
const RELIGION_GROUPS: Record<string, string[]> = {
  Hindu: ['Jain', 'Sikh', 'Buddhist'],
  Jain: ['Hindu', 'Sikh', 'Buddhist'],
  Sikh: ['Hindu', 'Jain'],
  Buddhist: ['Hindu', 'Jain'],
  Christian: ['Catholic', 'Protestant'],
  Catholic: ['Christian', 'Protestant'],
  Protestant: ['Christian', 'Catholic'],
};

// ── Education tiers ──────────────────────────────────────────────────
function educationTier(degree: string): number {
  const d = norm(degree);
  if (/(phd|doctor|md|md\.|m\.?d|dphil)/.test(d)) return 4;
  if (/(m\.?tech|m\.?s|m\.?b\.?a|master|mba|ca|cfa|m\.?com|m\.?a)/.test(d)) return 3;
  if (/(b\.?tech|b\.?e|bachelor|b\.?sc|b\.?com|b\.?a|bba|mbbs)/.test(d)) return 2;
  if (/(diploma|associate)/.test(d)) return 1;
  return 2; // sensible default
}

function preferenceFloorTier(pref?: string | null): number | null {
  if (!pref) return null;
  const p = norm(pref);
  if (p.includes('doctor') || p.includes('phd')) return 4;
  if (p.includes('master')) return 3;
  if (p.includes('bachelor') || p.includes('graduate')) return 2;
  return null;
}

// ── Profession / seniority ───────────────────────────────────────────
function seniorityTier(designation: string): number {
  const d = norm(designation);
  if (/(founder|ceo|cto|coo|cfo|chief|partner|director|vp|vice president|head)/.test(d)) return 4;
  if (/(senior|lead|principal|manager|architect)/.test(d)) return 3;
  if (/(associate|engineer|analyst|consultant|designer|executive|officer|specialist)/.test(d)) return 2;
  if (/(junior|intern|trainee|assistant)/.test(d)) return 1;
  return 2;
}

function incomeBand(income: number): number {
  // INR per annum → coarse bands.
  if (income >= 5_000_000) return 5; // 50L+
  if (income >= 3_000_000) return 4; // 30-50L
  if (income >= 1_800_000) return 3; // 18-30L
  if (income >= 1_000_000) return 2; // 10-18L
  return 1; // <10L
}

// ── Habit tolerance ──────────────────────────────────────────────────
const FREQ_RANK: Record<string, number> = {
  NEVER: 0,
  OCCASIONALLY: 1,
  SOCIALLY: 2,
  REGULARLY: 3,
};

// Tri-state openness (relocate/pets) → willingness rank.
const OPEN_RANK: Record<string, number> = { YES: 2, MAYBE: 1, NO: 0 };

// ─────────────────────────────────────────────────────────────────────
// Dimension scorers — each returns 0..100, pure & deterministic.
// "client" is the customer we are matching FOR; "cand" is the candidate.
// ─────────────────────────────────────────────────────────────────────

export function scoreAge(client: Customer, cand: Customer): number {
  const candAge = ageFromDob(cand.dateOfBirth);
  const clientAge = ageFromDob(client.dateOfBirth);
  const min = client.partnerAgePreferenceMin;
  const max = client.partnerAgePreferenceMax;

  if (min != null && max != null) {
    if (candAge >= min && candAge <= max) return 100;
    const dist = candAge < min ? min - candAge : candAge - max;
    return clamp(100 - dist * 8);
  }

  // Gender-default expectation when no explicit preference.
  const diff = candAge - clientAge;
  if (client.gender === 'MALE') {
    // Male client typically expects a (somewhat) younger partner: 0–6 yrs younger ideal.
    if (diff <= 0 && diff >= -6) return 100;
    if (diff > 0) return clamp(100 - diff * 12); // older than him decays faster
    return clamp(100 - (Math.abs(diff) - 6) * 8); // much younger decays
  }
  // Female client typically expects same-or-older partner: 0–6 yrs older ideal.
  if (diff >= 0 && diff <= 6) return 100;
  if (diff < 0) return clamp(100 - Math.abs(diff) * 12); // younger than her decays faster
  return clamp(100 - (diff - 6) * 8); // much older decays
}

/** Small height modifier folded into male-client matching (candidate shorter = nudge up). */
export function heightModifier(client: Customer, cand: Customer): number {
  if (client.gender !== 'MALE') return 0;
  // Reward candidate being shorter than the male client (assignment requirement).
  return cand.height < client.height ? 5 : cand.height === client.height ? 2 : 0;
}

export function scoreLocation(client: Customer, cand: Customer): number {
  let score: number;
  if (norm(client.city) === norm(cand.city)) {
    score = 100;
  } else if (client.preferredCities.map(norm).includes(norm(cand.city))) {
    score = 80;
  } else if (sameState(client.city, cand.city)) {
    score = 70;
  } else if (sameRegion(client.city, cand.city)) {
    score = 55;
  } else if (regionOf(client.city) !== 'OTHER' || regionOf(cand.city) !== 'OTHER') {
    score = 35;
  } else {
    score = 25;
  }
  // Openness to relocation softens distance (Yes lifts more than Maybe).
  const eitherYes = client.openToRelocate === 'YES' || cand.openToRelocate === 'YES';
  const eitherMaybe = client.openToRelocate === 'MAYBE' || cand.openToRelocate === 'MAYBE';
  if (eitherYes && score < 60) score = 60;
  else if (eitherMaybe && score < 50) score = 50;
  return clamp(score);
}

export function scoreReligion(client: Customer, cand: Customer): number {
  const a = client.religion.trim();
  const b = cand.religion.trim();
  const mismatch = norm(a) !== norm(b);

  // Hard non-negotiable: "same religion" required by the client.
  const requiresSame = client.nonNegotiables
    .map(norm)
    .some((n) => n.includes('same religion') || n.includes('same faith'));
  if (mismatch && requiresSame) return 0;

  if (!mismatch) return 100;
  const compatible = (RELIGION_GROUPS[a] ?? []).map(norm).includes(norm(b));
  return compatible ? 65 : 20;
}

export function scoreLanguage(client: Customer, cand: Customer): number {
  const a = [...client.languagesKnown, client.motherTongue];
  const b = [...cand.languagesKnown, cand.motherTongue];
  let score = jaccard(a, b);
  // Shared mother tongue is a strong signal.
  if (norm(client.motherTongue) === norm(cand.motherTongue)) {
    score = clamp(score + 20);
  }
  if (score === 0) return 10;
  return clamp(score);
}

export function scoreEducation(client: Customer, cand: Customer): number {
  const candTier = educationTier(cand.degree);
  const floor = preferenceFloorTier(client.educationPreference);
  if (floor != null) {
    if (candTier >= floor) return 100;
    return clamp(100 - (floor - candTier) * 35);
  }
  // No explicit preference → reward tier proximity.
  const clientTier = educationTier(client.degree);
  return clamp(100 - Math.abs(candTier - clientTier) * 25);
}

export function scoreProfession(client: Customer, cand: Customer): number {
  const candSeniority = seniorityTier(cand.designation);
  const clientSeniority = seniorityTier(client.designation);
  const candBand = incomeBand(cand.income);
  const clientBand = incomeBand(client.income);

  // Seniority compatibility — close tiers complement each other.
  const seniorityScore = clamp(100 - Math.abs(candSeniority - clientSeniority) * 22);

  let incomeScore: number;
  if (client.gender === 'MALE') {
    // Assignment requirement: candidate (female) lower or comparable income preferred.
    if (candBand < clientBand) incomeScore = 100;
    else if (candBand === clientBand) incomeScore = 85;
    else incomeScore = clamp(85 - (candBand - clientBand) * 20);
  } else {
    // Female client: reward stability/adequacy — comparable or higher is fine.
    if (candBand >= clientBand) incomeScore = 100;
    else incomeScore = clamp(100 - (clientBand - candBand) * 18);
  }

  // Weighted blend: income is the dominant term for male clients.
  const incomeWeight = client.gender === 'MALE' ? 0.6 : 0.45;
  return clamp(incomeScore * incomeWeight + seniorityScore * (1 - incomeWeight));
}

export function scoreFamily(client: Customer, cand: Customer): number {
  let score = client.familyType === cand.familyType ? 60 : 40;
  // Sibling count similarity.
  if (Math.abs(client.siblings - cand.siblings) <= 1) score += 20;
  // Family expectations keyword overlap.
  const ce = (client.familyExpectations ?? '').split(/[,;.]/).map((s) => s.trim()).filter(Boolean);
  const de = (cand.familyExpectations ?? '').split(/[,;.]/).map((s) => s.trim()).filter(Boolean);
  if (ce.length && de.length) {
    score += (jaccard(ce, de) / 100) * 20;
  } else {
    score += 10; // neutral-ish when unstated
  }
  return clamp(score);
}

export function scoreLifestyle(client: Customer, cand: Customer): number {
  const setOverlap = jaccard(client.lifestylePreferences, cand.lifestylePreferences);

  // Habit compatibility — diet exact match + smoking/drinking proximity.
  const dietScore = client.dietPreference === cand.dietPreference ? 100 : 55;
  const smokeGap = Math.abs(
    (FREQ_RANK[client.smokingPreference] ?? 0) - (FREQ_RANK[cand.smokingPreference] ?? 0)
  );
  const drinkGap = Math.abs(
    (FREQ_RANK[client.drinkingPreference] ?? 0) - (FREQ_RANK[cand.drinkingPreference] ?? 0)
  );
  const habitScore = clamp(100 - (smokeGap + drinkGap) * 18);
  const habitBlend = dietScore * 0.4 + habitScore * 0.6;

  return clamp(setOverlap * 0.5 + habitBlend * 0.5);
}

export function scoreChildren(client: Customer, cand: Customer): number {
  const a = client.wantKids;
  const b = cand.wantKids;
  if (a === b) {
    return a === 'OPEN' || a === 'MAYBE' ? 85 : 100; // definite match strongest
  }
  const definite = (x: string) => x === 'YES' || x === 'NO';
  const flexible = (x: string) => x === 'MAYBE' || x === 'OPEN';

  // YES vs NO — fundamental clash.
  if ((a === 'YES' && b === 'NO') || (a === 'NO' && b === 'YES')) return 10;
  // One definite, one flexible.
  if ((definite(a) && flexible(b)) || (flexible(a) && definite(b))) return 70;
  // Both flexible (MAYBE/OPEN combos).
  return 80;
}

export function scoreRelocation(client: Customer, cand: Customer): number {
  if (norm(client.city) === norm(cand.city)) return 100; // moot — already together
  // Blend both willingness ranks, weighting the more-willing party higher
  // (one partner fully open to relocating largely resolves the distance).
  const a = OPEN_RANK[client.openToRelocate] ?? 1;
  const b = OPEN_RANK[cand.openToRelocate] ?? 1;
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  const combined = (hi * 0.65 + lo * 0.35) / 2; // 0..1
  return clamp(20 + combined * 75); // both NO=20 · both MAYBE≈58 · both YES=95
}

export function scorePet(client: Customer, cand: Customer): number {
  if (client.openToPets === cand.openToPets) return 100;
  const involvesMaybe = client.openToPets === 'MAYBE' || cand.openToPets === 'MAYBE';
  return involvesMaybe ? 70 : 40; // Maybe bridges; Yes-vs-No is the real clash
}

export function scoreValues(client: Customer, cand: Customer): number {
  const valueOverlap = jaccard(client.coreValues, cand.coreValues); // 0..100

  // Non-negotiable satisfaction: does the candidate satisfy each client non-negotiable?
  const nn = client.nonNegotiables.map(norm);
  let satisfied = 0;
  for (const item of nn) {
    if (item.includes('non-smoker') || item.includes('no smoking')) {
      if (cand.smokingPreference === 'NEVER') satisfied++;
    } else if (item.includes('non-drinker') || item.includes('teetotal') || item.includes('no drinking')) {
      if (cand.drinkingPreference === 'NEVER') satisfied++;
    } else if (item.includes('vegetarian')) {
      if (['VEGETARIAN', 'VEGAN', 'JAIN'].includes(cand.dietPreference)) satisfied++;
    } else if (item.includes('same religion') || item.includes('same faith')) {
      if (norm(cand.religion) === norm(client.religion)) satisfied++;
    } else if (item.includes('wants kids') || item.includes('want children')) {
      if (cand.wantKids === 'YES' || cand.wantKids === 'OPEN') satisfied++;
    } else {
      // Unknown non-negotiable — check against candidate core values text.
      if (cand.coreValues.map(norm).some((v) => v.includes(item) || item.includes(v))) satisfied++;
      else satisfied += 0.5; // can't disprove → partial credit
    }
  }
  const nnScore = nn.length ? (satisfied / nn.length) * 100 : 100;

  // Long-term goal alignment folds into values (esp. for female clients).
  const goalAlign = jaccard(
    client.relationshipGoals.split(/[\s,]+/),
    cand.relationshipGoals.split(/[\s,]+/)
  );

  return clamp(valueOverlap * 0.55 + nnScore * 0.3 + goalAlign * 0.15);
}
