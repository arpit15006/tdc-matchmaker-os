import type { Prisma } from '@prisma/client';
import { AppError } from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { serializeCustomer } from '../../lib/serializers';
import { ageFromDob } from '../../services/compatibility/scorers';
import type { CustomerListQuery } from './customers.schema';

// Use current date for age filtering so results stay accurate.
const AGE_REF = new Date();

/** Convert an age (years) into the dateOfBirth boundary for filtering. */
function dobForAge(age: number): Date {
  return new Date(Date.UTC(AGE_REF.getUTCFullYear() - age, AGE_REF.getUTCMonth(), AGE_REF.getUTCDate()));
}

export async function listCustomers(query: CustomerListQuery) {
  const where: Prisma.CustomerWhereInput = {};
  const and: Prisma.CustomerWhereInput[] = [];

  if (query.gender) where.gender = query.gender;
  if (query.city) where.city = { equals: query.city, mode: 'insensitive' };
  if (query.religion) where.religion = { equals: query.religion, mode: 'insensitive' };
  if (query.stage) where.currentStage = query.stage;

  if (query.profession) {
    and.push({
      OR: [
        { designation: { contains: query.profession, mode: 'insensitive' } },
        { currentCompany: { contains: query.profession, mode: 'insensitive' } },
      ],
    });
  }

  // Age filter → dateOfBirth range (older age = earlier DOB).
  if (query.minAge != null || query.maxAge != null) {
    const dob: Prisma.DateTimeFilter = {};
    if (query.maxAge != null) dob.gte = dobForAge(query.maxAge); // oldest allowed
    if (query.minAge != null) dob.lte = dobForAge(query.minAge); // youngest allowed
    where.dateOfBirth = dob;
  }

  if (query.q) {
    and.push({
      OR: [
        { firstName: { contains: query.q, mode: 'insensitive' } },
        { lastName: { contains: query.q, mode: 'insensitive' } },
        { email: { contains: query.q, mode: 'insensitive' } },
        { city: { contains: query.q, mode: 'insensitive' } },
        { currentCompany: { contains: query.q, mode: 'insensitive' } },
        { designation: { contains: query.q, mode: 'insensitive' } },
      ],
    });
  }

  if (and.length) where.AND = and;

  // Sorting. Age sorts by dateOfBirth inverted (younger = later DOB).
  let orderBy: Prisma.CustomerOrderByWithRelationInput;
  switch (query.sort) {
    case 'age':
      orderBy = { dateOfBirth: query.order === 'asc' ? 'desc' : 'asc' };
      break;
    case 'lastInteraction':
      orderBy = { lastInteractionDate: query.order };
      break;
    case 'activityScore':
      orderBy = { matchActivityScore: query.order };
      break;
    case 'stage':
      orderBy = { currentStage: query.order };
      break;
    default:
      orderBy = { firstName: query.order };
  }

  const skip = (query.page - 1) * query.pageSize;

  const [total, rows] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy,
      skip,
      take: query.pageSize,
      include: { assignedMatchmaker: { select: { id: true, name: true } } },
    }),
  ]);

  return {
    data: rows.map((c) => ({
      ...serializeCustomer(c),
      assignedMatchmaker: c.assignedMatchmaker,
    })),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      assignedMatchmaker: { select: { id: true, name: true } },
      _count: { select: { notes: true, timeline: true, matchesAsClient: true } },
    },
  });
  if (!customer) throw AppError.notFound('Customer not found');

  return {
    ...serializeCustomer(customer),
    assignedMatchmaker: customer.assignedMatchmaker,
    counts: customer._count,
  };
}

export async function updateStage(id: string, stage: CustomerListQuery['stage'] & string) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw AppError.notFound('Customer not found');
  if (customer.currentStage === stage) return serializeCustomer(customer);

  const updated = await prisma.customer.update({
    where: { id },
    data: { currentStage: stage, lastInteractionDate: new Date() },
  });

  await prisma.timelineEvent.create({
    data: {
      customerId: id,
      type: 'STAGE_CHANGE',
      description: `Stage changed from ${customer.currentStage} to ${stage}`,
      metadata: { from: customer.currentStage, to: stage },
    },
  });

  return serializeCustomer(updated);
}

/** Distinct filter option values for the customer list UI. */
export async function getFilterOptions() {
  const customers = await prisma.customer.findMany({
    select: { city: true, religion: true },
  });
  const cities = [...new Set(customers.map((c) => c.city))].sort();
  const religions = [...new Set(customers.map((c) => c.religion))].sort();
  return { cities, religions };
}

export { ageFromDob };
