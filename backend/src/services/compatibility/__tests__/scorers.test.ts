import { describe, expect, it } from 'vitest';
import {
  clamp,
  heightModifier,
  jaccard,
  scoreAge,
  scoreChildren,
  scoreProfession,
  scoreRelocation,
} from '../scorers';
import { dobForAge, makeCustomer } from './factory';

// These tests pin the assignment's explicit gender-specific requirements so a
// future refactor can't silently break them.

describe('helpers', () => {
  it('clamp bounds values to 0..100', () => {
    expect(clamp(-20)).toBe(0);
    expect(clamp(140)).toBe(100);
    expect(clamp(73)).toBe(73);
  });

  it('jaccard scores set overlap, neutral when both empty', () => {
    expect(jaccard(['a', 'b'], ['a', 'b'])).toBe(100);
    expect(jaccard(['a', 'b'], ['c', 'd'])).toBe(0);
    expect(jaccard([], [])).toBe(50); // neutral when neither side states anything
    expect(jaccard(['a', 'b'], ['a', 'c'])).toBeCloseTo(33.33, 1); // 1 shared / 3 union
  });
});

describe('male client → younger partner preferred', () => {
  const male = makeCustomer({ gender: 'MALE', dateOfBirth: dobForAge(32) });

  it('ranks a younger candidate above an older one', () => {
    const younger = makeCustomer({ gender: 'FEMALE', dateOfBirth: dobForAge(28) });
    const older = makeCustomer({ gender: 'FEMALE', dateOfBirth: dobForAge(38) });
    expect(scoreAge(male, younger)).toBeGreaterThan(scoreAge(male, older));
  });

  it('gives a 0–6yr-younger candidate a perfect age score', () => {
    const ideal = makeCustomer({ gender: 'FEMALE', dateOfBirth: dobForAge(28) });
    expect(scoreAge(male, ideal)).toBe(100);
  });
});

describe('male client → shorter partner nudged up', () => {
  const male = makeCustomer({ gender: 'MALE', height: 180 });

  it('rewards a shorter candidate and not a taller one', () => {
    const shorter = makeCustomer({ gender: 'FEMALE', height: 162 });
    const taller = makeCustomer({ gender: 'FEMALE', height: 184 });
    expect(heightModifier(male, shorter)).toBeGreaterThan(heightModifier(male, taller));
    expect(heightModifier(male, taller)).toBe(0);
  });

  it('is a no-op for female clients (logic is male-specific)', () => {
    const female = makeCustomer({ gender: 'FEMALE', height: 165 });
    const cand = makeCustomer({ gender: 'MALE', height: 150 });
    expect(heightModifier(female, cand)).toBe(0);
  });
});

describe('male client → candidate who earns less preferred', () => {
  const male = makeCustomer({ gender: 'MALE', income: 3_000_000, designation: 'Engineer' });

  it('scores a lower-income candidate above a higher-income one', () => {
    const earnsLess = makeCustomer({ gender: 'FEMALE', income: 1_200_000, designation: 'Engineer' });
    const earnsMore = makeCustomer({ gender: 'FEMALE', income: 6_000_000, designation: 'Engineer' });
    expect(scoreProfession(male, earnsLess)).toBeGreaterThan(scoreProfession(male, earnsMore));
  });

  it('female client instead rewards comparable-or-higher income (not lower)', () => {
    const female = makeCustomer({ gender: 'FEMALE', income: 3_000_000, designation: 'Engineer' });
    const higher = makeCustomer({ gender: 'MALE', income: 6_000_000, designation: 'Engineer' });
    const lower = makeCustomer({ gender: 'MALE', income: 1_200_000, designation: 'Engineer' });
    expect(scoreProfession(female, higher)).toBeGreaterThan(scoreProfession(female, lower));
  });
});

describe('children preference alignment (both genders)', () => {
  const client = makeCustomer({ wantKids: 'YES' });

  it('treats YES vs NO as a fundamental clash', () => {
    const clash = makeCustomer({ wantKids: 'NO' });
    expect(scoreChildren(client, clash)).toBeLessThanOrEqual(10);
  });

  it('rewards an exact definite match', () => {
    const match = makeCustomer({ wantKids: 'YES' });
    expect(scoreChildren(client, match)).toBe(100);
  });
});

describe('relocation compatibility', () => {
  it('two willing partners score far above two unwilling ones', () => {
    const a = makeCustomer({ city: 'Mumbai', openToRelocate: 'YES' });
    const willing = makeCustomer({ city: 'Delhi', openToRelocate: 'YES' });
    const stuck = makeCustomer({ city: 'Delhi', openToRelocate: 'NO' });
    const stuckClient = makeCustomer({ city: 'Mumbai', openToRelocate: 'NO' });
    expect(scoreRelocation(a, willing)).toBeGreaterThan(scoreRelocation(stuckClient, stuck));
  });
});
