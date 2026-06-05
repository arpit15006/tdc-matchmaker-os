import { z } from 'zod';

const FUNNEL_STAGES = [
  'PROFILE_REVIEW',
  'VERIFIED',
  'ACTIVE_SEARCH',
  'POTENTIAL_MATCH_FOUND',
  'INTRODUCTION_SENT',
  'FIRST_CALL_SCHEDULED',
  'DATING',
  'RELATIONSHIP',
  'ENGAGED',
  'MARRIED',
] as const;

export const customerListQuerySchema = z.object({
  q: z.string().trim().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  minAge: z.coerce.number().int().min(18).max(99).optional(),
  maxAge: z.coerce.number().int().min(18).max(99).optional(),
  city: z.string().trim().optional(),
  religion: z.string().trim().optional(),
  profession: z.string().trim().optional(),
  stage: z.enum(FUNNEL_STAGES).optional(),
  sort: z.enum(['name', 'age', 'lastInteraction', 'activityScore', 'stage']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;

export const updateStageSchema = z.object({
  stage: z.enum(FUNNEL_STAGES),
});
