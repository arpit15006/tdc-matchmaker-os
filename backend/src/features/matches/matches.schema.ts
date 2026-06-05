import { z } from 'zod';

const MATCH_STATUSES = [
  'NEW',
  'WAITING_REVIEW',
  'SENT',
  'AWAITING_FEEDBACK',
  'ACCEPTED',
  'REJECTED',
  'ON_HOLD',
] as const;

export const updateMatchStatusSchema = z.object({
  status: z.enum(MATCH_STATUSES),
});

export const sendMatchSchema = z.object({
  // Optional intro text captured from the Send Match workflow.
  introduction: z.string().trim().max(4000).optional(),
  tone: z.enum(['warm', 'professional', 'personalized']).optional(),
});

export const feedbackSchema = z.object({
  response: z.enum([
    'INTERESTED',
    'NOT_INTERESTED',
    'NEED_MORE_TIME',
    'DATE_SCHEDULED',
    'FOLLOW_UP_NEEDED',
  ]),
  reason: z
    .enum([
      'LOCATION_MISMATCH',
      'LIFESTYLE_MISMATCH',
      'TIMING',
      'FAMILY_CONCERNS',
      'NO_CHEMISTRY',
      'OTHER',
    ])
    .optional(),
  notes: z.string().trim().max(2000).optional(),
});
