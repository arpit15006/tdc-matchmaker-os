import type { Request, Response } from 'express';
import { Router } from 'express';
import { AppError } from '../../errors/AppError';
import { asyncHandler } from '../../lib/asyncHandler';
import { prisma } from '../../lib/prisma';
import type { Breakdown } from '../../services/compatibility/types';
import {
  generateInsights,
  generateIntroductions,
  generateMatchExplanation,
} from '../../services/groq/groqService';

/**
 * Feature 1 — "Why This Match" explanation. Cached on Match.aiExplanation;
 * pass ?refresh=true to regenerate. Mounted on the matches router.
 */
export async function matchExplanationHandler(req: Request, res: Response) {
  const match = await prisma.match.findUnique({
    where: { id: req.params.matchId },
    include: { customer: true, candidate: true },
  });
  if (!match) throw AppError.notFound('Match not found');

  const refresh = req.query.refresh === 'true';
  if (match.aiExplanation && !refresh) {
    return res.json({ explanation: match.aiExplanation, cached: true });
  }

  const explanation = await generateMatchExplanation(
    match.customer,
    match.candidate,
    match.breakdown as Breakdown,
    match.strengths,
    match.concerns
  );

  await prisma.match.update({
    where: { id: match.id },
    data: { aiExplanation: explanation },
  });

  return res.json({ explanation, cached: false });
}

/**
 * Feature 2 — Introduction generator. Returns warm / professional /
 * personalized variants. Mounted on the matches router.
 */
export async function matchIntroductionHandler(req: Request, res: Response) {
  const match = await prisma.match.findUnique({
    where: { id: req.params.matchId },
    include: { customer: true, candidate: true },
  });
  if (!match) throw AppError.notFound('Match not found');

  const variants = await generateIntroductions(match.customer, match.candidate);
  return res.json({ variants });
}

/**
 * Feature 3 — Matchmaker insights. Mounted at /api/customers/:id/insights.
 */
export const customerInsightsRouter = Router({ mergeParams: true });

customerInsightsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!customer) throw AppError.notFound('Customer not found');

    const [notes, timeline] = await Promise.all([
      prisma.note.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: { category: true, content: true, createdAt: true },
      }),
      prisma.timelineEvent.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: { type: true, description: true, createdAt: true },
      }),
    ]);

    const insights = await generateInsights(customer, notes, timeline);
    res.json(insights);
  })
);
