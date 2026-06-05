import type { Prisma } from '@prisma/client';
import {
  CITIES,
  COLLEGES,
  COMPANIES,
  CORE_VALUES,
  DEGREES,
  DESIGNATIONS_BY_BAND,
  EDUCATION_PREFERENCES,
  FAMILY_EXPECTATIONS,
  FEMALE_NAMES,
  LIFESTYLE_TAGS,
  MALE_NAMES,
  NON_NEGOTIABLES,
  RELATIONSHIP_GOALS,
  RELIGIONS,
  SURNAMES,
} from './pools';

// ── Deterministic PRNG (mulberry32) ──────────────────────────────────
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fixed base date so backdated timestamps are stable across re-seeds.
const BASE_DATE = new Date('2026-01-01T00:00:00Z');

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(rng: () => number, arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function dobForAge(age: number, rng: () => number): Date {
  const year = BASE_DATE.getUTCFullYear() - age;
  const month = Math.floor(rng() * 12);
  const day = 1 + Math.floor(rng() * 27);
  return new Date(Date.UTC(year, month, day));
}

const DIETS = ['VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN', 'EGGETARIAN', 'JAIN'] as const;
const FREQS = ['NEVER', 'OCCASIONALLY', 'SOCIALLY', 'REGULARLY'] as const;
const WANT_KIDS = ['YES', 'NO', 'MAYBE', 'OPEN'] as const;
const OPEN_PREF = ['YES', 'NO', 'MAYBE'] as const;
const MANGLIK = ['YES', 'NO', 'PARTIAL', 'DONT_KNOW'] as const;
const MARITAL = ['NEVER_MARRIED', 'NEVER_MARRIED', 'NEVER_MARRIED', 'DIVORCED', 'WIDOWED'] as const;

export interface GeneratedProfile {
  data: Omit<Prisma.CustomerCreateInput, 'assignedMatchmaker'> & {
    assignedMatchmakerId?: string;
  };
}

/**
 * Generate `count` deterministic, non-repetitive profiles for a gender.
 * The PRNG is seeded per gender; offset hashing across pools ensures adjacent
 * profiles differ across many axes (no repeated records).
 */
export function generateProfiles(
  gender: 'MALE' | 'FEMALE',
  count: number,
  seed: number
): GeneratedProfile[] {
  const rng = mulberry32(seed);
  const names = gender === 'MALE' ? MALE_NAMES : FEMALE_NAMES;
  const profiles: GeneratedProfile[] = [];

  for (let i = 0; i < count; i++) {
    // Offset-hashed indices so each axis rotates independently.
    const firstName = names[i % names.length];
    const lastName = SURNAMES[(i * 7 + 3) % SURNAMES.length];
    const cityInfo = CITIES[(i * 5 + 1) % CITIES.length];
    const religionInfo = RELIGIONS[(i * 3 + 2) % RELIGIONS.length];
    const caste = religionInfo.castes[(i * 2) % religionInfo.castes.length];
    const college = COLLEGES[(i * 11 + 4) % COLLEGES.length];
    const degree = DEGREES[(i * 13 + 6) % DEGREES.length];
    const company = COMPANIES[(i * 17 + 5) % COMPANIES.length];

    const motherTongue = cityInfo.motherTongues[i % cityInfo.motherTongues.length];
    const otherLangs = pickN(rng, ['Hindi', 'English', 'Tamil', 'Bengali', 'Telugu', 'Marathi'], 1 + (i % 2));
    const languagesKnown = [...new Set([motherTongue, 'English', ...otherLangs])];

    // Income aligned with company band + some spread.
    const band = company.band;
    const baseIncome = [600000, 1000000, 1600000, 2800000, 4500000][band - 1];
    const income = Math.round((baseIncome + Math.floor(rng() * baseIncome * 0.4)) / 10000) * 10000;
    const designation = pick(rng, DESIGNATIONS_BY_BAND[band] ?? DESIGNATIONS_BY_BAND[2]);

    // Age 25-40; height gender-appropriate.
    const age = 25 + (i % 16);
    const height =
      gender === 'MALE' ? 165 + ((i * 3) % 22) : 150 + ((i * 3) % 22);

    // Partner age preference derived from own attributes & gender norms.
    const partnerAgePreferenceMin = gender === 'MALE' ? Math.max(23, age - 6) : age - 1;
    const partnerAgePreferenceMax = gender === 'MALE' ? age : age + 7;

    const lifestylePreferences = pickN(rng, LIFESTYLE_TAGS, 3 + (i % 3));
    const coreValues = pickN(rng, CORE_VALUES, 3 + (i % 3));
    const nonNegotiables = pickN(rng, NON_NEGOTIABLES, 1 + (i % 3));

    const wantKids = WANT_KIDS[(i * 2 + 1) % WANT_KIDS.length];
    const diet = DIETS[(i * 3) % DIETS.length];
    const smoking = FREQS[(i * 2) % (gender === 'FEMALE' ? 2 : FREQS.length)]; // women skew lower
    const drinking = FREQS[(i + 1) % FREQS.length];

    const preferredCities = pickN(
      rng,
      CITIES.filter((c) => c.city !== cityInfo.city).map((c) => c.city),
      2
    );

    const emailSlug = `${firstName}.${lastName}.${i}`
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '');

    profiles.push({
      data: {
        firstName,
        lastName,
        gender,
        dateOfBirth: dobForAge(age, rng),
        country: 'India',
        city: cityInfo.city,
        height,
        email: `${emailSlug}@example.com`,
        phone: `+9198${String(10000000 + ((i * 271 + (gender === 'MALE' ? 1 : 5)) % 89999999)).padStart(8, '0')}`,
        undergraduateCollege: college.name,
        degree,
        income,
        currentCompany: company.name,
        designation,
        maritalStatus: MARITAL[(i * 5) % MARITAL.length],
        languagesKnown,
        siblings: i % 3,
        religion: religionInfo.religion,
        caste,
        wantKids,
        openToRelocate: OPEN_PREF[i % 3],
        openToPets: OPEN_PREF[(i + 1) % 3],
        motherTongue,
        dietPreference: diet,
        smokingPreference: smoking,
        drinkingPreference: drinking,
        familyType: i % 2 === 0 ? 'NUCLEAR' : 'JOINT',
        manglik: religionInfo.religion === 'Hindu' ? MANGLIK[i % MANGLIK.length] : 'NO',
        educationPreference: EDUCATION_PREFERENCES[(i * 2) % EDUCATION_PREFERENCES.length],
        partnerAgePreferenceMin,
        partnerAgePreferenceMax,
        preferredCities,
        relationshipGoals: RELATIONSHIP_GOALS[(i * 3) % RELATIONSHIP_GOALS.length],
        familyExpectations: FAMILY_EXPECTATIONS[(i * 2 + 1) % FAMILY_EXPECTATIONS.length],
        lifestylePreferences,
        coreValues,
        nonNegotiables,
      },
    });
  }

  return profiles;
}

export { BASE_DATE };
