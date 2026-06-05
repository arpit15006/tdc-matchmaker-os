import { z } from 'zod';

const CATEGORIES = [
  'GENERAL',
  'PREFERENCE',
  'CONCERN',
  'CALL_LOG',
  'FAMILY',
  'FEEDBACK',
  'STRATEGY',
] as const;

export const createNoteSchema = z.object({
  category: z.enum(CATEGORIES).default('GENERAL'),
  content: z.string().trim().min(1, 'Note content is required').max(4000),
});

export const updateNoteSchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  content: z.string().trim().min(1).max(4000).optional(),
});
