import type { Customer } from '@prisma/client';
import { z } from 'zod';
import { AppError } from '../../errors/AppError';
import type { Breakdown } from '../compatibility/types';
import { callGroq } from './groqClient';
import {
  EXPLANATION_SYSTEM,
  INSIGHTS_SYSTEM,
  INTRODUCTION_SYSTEM,
  explanationUser,
  insightsUser,
  introductionUser,
} from './prompts';

/** Robust JSON extraction — handles models that wrap JSON in prose/fences. */
function parseJson<T>(raw: string, schema: z.ZodSchema<T>): T {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  try {
    return schema.parse(JSON.parse(text));
  } catch {
    throw AppError.upstream('AI returned malformed output. Please try again.');
  }
}

// ── Feature 1: Match explanation ─────────────────────────────────────
export async function generateMatchExplanation(
  client: Customer,
  candidate: Customer,
  breakdown: Breakdown,
  strengths: string[],
  concerns: string[]
): Promise<string> {
  return callGroq({
    system: EXPLANATION_SYSTEM,
    user: explanationUser(client, candidate, breakdown, strengths, concerns),
    temperature: 0.3,
    maxTokens: 550,
  });
}

// ── Feature 2: Introduction generator ────────────────────────────────
const introSchema = z.object({
  warm: z.string().min(1),
  professional: z.string().min(1),
  personalized: z.string().min(1),
});
export type IntroductionVariants = z.infer<typeof introSchema>;

export async function generateIntroductions(
  client: Customer,
  candidate: Customer
): Promise<IntroductionVariants> {
  const raw = await callGroq({
    system: INTRODUCTION_SYSTEM,
    user: introductionUser(client, candidate),
    temperature: 0.6,
    maxTokens: 700,
    json: true,
  });
  return parseJson(raw, introSchema);
}

// ── Feature 3: Matchmaker insights ───────────────────────────────────
const insightsSchema = z.object({
  personalitySummary: z.string().min(1),
  relationshipPriorities: z.array(z.string()).min(1),
  potentialChallenges: z.array(z.string()),
  suggestedStrategy: z.string().min(1),
});
export type MatchmakerInsights = z.infer<typeof insightsSchema>;

export async function generateInsights(
  client: Customer,
  notes: { category: string; content: string; createdAt: Date }[],
  timeline: { type: string; description: string; createdAt: Date }[]
): Promise<MatchmakerInsights> {
  const raw = await callGroq({
    system: INSIGHTS_SYSTEM,
    user: insightsUser(client, notes, timeline),
    temperature: 0.4,
    maxTokens: 700,
    json: true,
  });
  return parseJson(raw, insightsSchema);
}
