import type { Customer } from '@prisma/client';

/**
 * Build a fully-populated `Customer` for tests. Every scalar field has a sensible
 * default; pass `overrides` to vary just the dimensions a test cares about.
 */
let seq = 0;

export function dobForAge(age: number): Date {
  // A birth date `age` years before now (mid-year to avoid month/day edge cases).
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear() - age, 0, 1));
}

export function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  seq += 1;
  const base: Customer = {
    id: `cust_${String(seq).padStart(4, '0')}`,
    firstName: 'Test',
    lastName: `User${seq}`,
    gender: 'FEMALE',
    dateOfBirth: dobForAge(28),
    country: 'India',
    city: 'Mumbai',
    height: 165,
    email: `user${seq}@example.com`,
    phone: `+9198000000${seq}`,
    emailVerified: true,
    phoneVerified: true,
    undergraduateCollege: 'IIT Bombay',
    degree: 'B.Tech',
    income: 1_500_000,
    currentCompany: 'Acme',
    designation: 'Engineer',
    maritalStatus: 'NEVER_MARRIED',
    languagesKnown: ['Hindi', 'English'],
    siblings: 1,
    religion: 'Hindu',
    caste: null,
    wantKids: 'YES',
    openToRelocate: 'MAYBE',
    openToPets: 'MAYBE',
    motherTongue: 'Hindi',
    dietPreference: 'VEGETARIAN',
    smokingPreference: 'NEVER',
    drinkingPreference: 'OCCASIONALLY',
    familyType: 'NUCLEAR',
    manglik: 'NO',
    educationPreference: null,
    partnerAgePreferenceMin: null,
    partnerAgePreferenceMax: null,
    preferredCities: [],
    relationshipGoals: 'long-term marriage partnership',
    familyExpectations: null,
    lifestylePreferences: ['fitness', 'travel'],
    coreValues: ['family', 'honesty', 'ambition'],
    nonNegotiables: [],
    currentStage: 'ACTIVE_SEARCH',
    assignedMatchmakerId: null,
    lastInteractionDate: null,
    matchActivityScore: 0,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };
  return { ...base, ...overrides };
}
