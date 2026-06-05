import { describe, expect, it } from 'vitest';
import { rankCandidates } from '../../matchEngine/matchEngine.service';
import { scoreCompatibility } from '../compatibility.service';
import { weightsFor } from '../weights';
import { dobForAge, makeCustomer } from './factory';

describe('weight tables', () => {
  it('each gender table sums to exactly 1.00', () => {
    for (const gender of ['MALE', 'FEMALE'] as const) {
      const sum = Object.values(weightsFor(gender)).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 9);
    }
  });

  it('weights differ by gender (male leads on age, female on profession)', () => {
    const male = weightsFor('MALE');
    const female = weightsFor('FEMALE');
    expect(male.age).toBeGreaterThan(female.age);
    expect(female.profession).toBeGreaterThan(male.profession);
    expect(female.values).toBeGreaterThan(male.values);
    expect(female.relocation).toBeGreaterThan(male.relocation);
  });
});

describe('scoreCompatibility', () => {
  it('returns a bounded score and a complete 12-dimension breakdown', () => {
    const client = makeCustomer({ gender: 'MALE' });
    const cand = makeCustomer({ gender: 'FEMALE' });
    const result = scoreCompatibility(client, cand);

    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(Object.keys(result.breakdown)).toHaveLength(12);
    for (const v of Object.values(result.breakdown)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it('is deterministic — identical inputs yield an identical result', () => {
    const client = makeCustomer({ gender: 'MALE', id: 'fixed_client' });
    const cand = makeCustomer({ gender: 'FEMALE', id: 'fixed_cand' });
    expect(scoreCompatibility(client, cand)).toEqual(scoreCompatibility(client, cand));
  });

  it('surfaces a strong, aligned pair as a high-scoring match', () => {
    const client = makeCustomer({
      gender: 'MALE',
      dateOfBirth: dobForAge(32),
      height: 180,
      income: 3_000_000,
      city: 'Mumbai',
      religion: 'Hindu',
      wantKids: 'YES',
      coreValues: ['family', 'honesty', 'ambition'],
    });
    const aligned = makeCustomer({
      gender: 'FEMALE',
      dateOfBirth: dobForAge(28), // younger
      height: 162, // shorter
      income: 1_200_000, // earns less
      city: 'Mumbai',
      religion: 'Hindu',
      wantKids: 'YES', // matching children view
      coreValues: ['family', 'honesty', 'ambition'],
    });
    expect(scoreCompatibility(client, aligned).overallScore).toBeGreaterThanOrEqual(80);
  });
});

describe('rankCandidates', () => {
  const client = makeCustomer({ gender: 'MALE', id: 'client_1' });

  it('only ranks opposite-gender candidates and excludes the client itself', () => {
    const pool = [
      client,
      makeCustomer({ gender: 'MALE', id: 'male_a' }), // same gender — excluded
      makeCustomer({ gender: 'FEMALE', id: 'fem_a' }),
      makeCustomer({ gender: 'FEMALE', id: 'fem_b' }),
    ];
    const ranked = rankCandidates(client, pool);
    expect(ranked.every((r) => r.candidate.gender === 'FEMALE')).toBe(true);
    expect(ranked.some((r) => r.candidate.id === client.id)).toBe(false);
    expect(ranked).toHaveLength(2);
  });

  it('sorts by overall score descending', () => {
    const pool = Array.from({ length: 6 }, (_, i) =>
      makeCustomer({ gender: 'FEMALE', id: `f_${i}`, dateOfBirth: dobForAge(26 + i) })
    );
    const ranked = rankCandidates(client, pool);
    const scores = ranked.map((r) => r.result.overallScore);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('caps the result at the Top 10', () => {
    const pool = Array.from({ length: 25 }, (_, i) =>
      makeCustomer({ gender: 'FEMALE', id: `f_${String(i).padStart(2, '0')}` })
    );
    expect(rankCandidates(client, pool)).toHaveLength(10);
  });

  it('breaks score ties deterministically by candidate id', () => {
    // Identical profiles → identical scores → tie broken by id ascending.
    const pool = [
      makeCustomer({ gender: 'FEMALE', id: 'f_zzz' }),
      makeCustomer({ gender: 'FEMALE', id: 'f_aaa' }),
      makeCustomer({ gender: 'FEMALE', id: 'f_mmm' }),
    ];
    const ids = rankCandidates(client, pool).map((r) => r.candidate.id);
    expect(ids).toEqual(['f_aaa', 'f_mmm', 'f_zzz']);
  });
});
