import type { Customer } from '@prisma/client';
import { ageFromDob } from '../services/compatibility/scorers';

/** Whether both email and phone are verified. */
export function isVerified(c: Pick<Customer, 'emailVerified' | 'phoneVerified'>): boolean {
  return c.emailVerified && c.phoneVerified;
}

/** Customer + derived fields, used in API responses. */
export function serializeCustomer(c: Customer) {
  return {
    ...c,
    age: ageFromDob(c.dateOfBirth),
    verified: isVerified(c),
  };
}

/** Compact summary used in match cards / lists. */
export function serializeCustomerSummary(c: Customer) {
  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    gender: c.gender,
    age: ageFromDob(c.dateOfBirth),
    city: c.city,
    designation: c.designation,
    currentCompany: c.currentCompany,
    religion: c.religion,
    degree: c.degree,
    currentStage: c.currentStage,
    verified: isVerified(c),
    relationshipGoals: c.relationshipGoals,
  };
}
