import type { FeedbackReason, FeedbackResponse, MatchStatus } from '@prisma/client';
import { AppError } from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { serializeCustomerSummary } from '../../lib/serializers';
import { stageIndex } from '../../config/constants';
import { generateMatches } from '../../services/matchEngine/matchEngine.service';

/** Run the engine and return the freshly persisted Top 10 for a client. */
export async function generateForCustomer(customerId: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw AppError.notFound('Customer not found');

  await generateMatches(prisma, customerId);
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      lastInteractionDate: new Date(),
      matchActivityScore: { increment: 5 },
    },
  });
  return listForCustomer(customerId);
}

export async function listForCustomer(customerId: string) {
  const matches = await prisma.match.findMany({
    where: { customerId },
    orderBy: [{ overallScore: 'desc' }, { candidateId: 'asc' }],
    include: {
      candidate: true,
      feedback: { orderBy: { createdAt: 'desc' } },
    },
  });

  return matches.map((m) => ({
    id: m.id,
    customerId: m.customerId,
    overallScore: m.overallScore,
    breakdown: m.breakdown,
    strengths: m.strengths,
    concerns: m.concerns,
    status: m.status,
    aiExplanation: m.aiExplanation,
    createdAt: m.createdAt,
    candidate: serializeCustomerSummary(m.candidate),
    feedback: m.feedback,
  }));
}

export async function getMatch(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      candidate: true,
      customer: true,
      feedback: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!match) throw AppError.notFound('Match not found');
  return {
    id: match.id,
    overallScore: match.overallScore,
    breakdown: match.breakdown,
    strengths: match.strengths,
    concerns: match.concerns,
    status: match.status,
    aiExplanation: match.aiExplanation,
    createdAt: match.createdAt,
    candidate: serializeCustomerSummary(match.candidate),
    client: serializeCustomerSummary(match.customer),
    feedback: match.feedback,
  };
}

export async function updateStatus(matchId: string, status: MatchStatus) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw AppError.notFound('Match not found');

  const updated = await prisma.match.update({ where: { id: matchId }, data: { status } });
  await prisma.timelineEvent.create({
    data: {
      customerId: match.customerId,
      type: 'STATUS_UPDATE',
      description: `Match status updated to ${status}`,
      metadata: { matchId, status },
    },
  });
  return updated;
}

/**
 * Send-match workflow: mark the match SENT/AWAITING_FEEDBACK, advance the
 * client's stage to INTRODUCTION_SENT if earlier, store the intro text, and
 * record a timeline event.
 */
export async function sendMatch(
  matchId: string,
  data: { introduction?: string; tone?: string }
) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { customer: true, candidate: true },
  });
  if (!match) throw AppError.notFound('Match not found');

  const advanceStage = stageIndex(match.customer.currentStage) < stageIndex('INTRODUCTION_SENT');

  await prisma.$transaction([
    prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'AWAITING_FEEDBACK',
        ...(data.introduction ? { aiExplanation: data.introduction } : {}),
      },
    }),
    prisma.customer.update({
      where: { id: match.customerId },
      data: {
        lastInteractionDate: new Date(),
        matchActivityScore: { increment: 10 },
        ...(advanceStage ? { currentStage: 'INTRODUCTION_SENT' } : {}),
      },
    }),
    prisma.timelineEvent.create({
      data: {
        customerId: match.customerId,
        type: 'INTRODUCTION_SENT',
        description: `Introduction sent for match with ${match.candidate.firstName} ${match.candidate.lastName}`,
        metadata: {
          matchId,
          candidateId: match.candidateId,
          tone: data.tone ?? null,
          introduction: data.introduction ?? null,
        },
      },
    }),
  ]);

  return getMatch(matchId);
}

export async function addFeedback(
  matchId: string,
  data: { response: FeedbackResponse; reason?: FeedbackReason; notes?: string }
) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { candidate: true },
  });
  if (!match) throw AppError.notFound('Match not found');

  const feedback = await prisma.matchFeedback.create({
    data: {
      matchId,
      response: data.response,
      reason: data.reason ?? null,
      notes: data.notes ?? null,
    },
  });

  // Status transitions driven by feedback.
  let newStatus: MatchStatus = match.status;
  if (data.response === 'INTERESTED' || data.response === 'DATE_SCHEDULED') newStatus = 'ACCEPTED';
  else if (data.response === 'NOT_INTERESTED') newStatus = 'REJECTED';
  else if (data.response === 'NEED_MORE_TIME') newStatus = 'ON_HOLD';

  await prisma.$transaction([
    prisma.match.update({ where: { id: matchId }, data: { status: newStatus } }),
    prisma.timelineEvent.create({
      data: {
        customerId: match.customerId,
        type: 'FEEDBACK_RECEIVED',
        description: `Feedback received: ${data.response}${data.reason ? ` (${data.reason})` : ''}`,
        metadata: { matchId, ...data },
      },
    }),
    prisma.customer.update({
      where: { id: match.customerId },
      data: { lastInteractionDate: new Date() },
    }),
  ]);

  // Advancing the journey when a date is scheduled.
  if (data.response === 'DATE_SCHEDULED') {
    const client = await prisma.customer.findUnique({ where: { id: match.customerId } });
    if (client && stageIndex(client.currentStage) < stageIndex('FIRST_CALL_SCHEDULED')) {
      await prisma.customer.update({
        where: { id: match.customerId },
        data: { currentStage: 'FIRST_CALL_SCHEDULED' },
      });
    }
  }

  return feedback;
}

export async function listFeedback(matchId: string) {
  return prisma.matchFeedback.findMany({
    where: { matchId },
    orderBy: { createdAt: 'desc' },
  });
}

/** Pending match queue grouped by workflow column. */
export async function getQueue() {
  const matches = await prisma.match.findMany({
    where: { status: { in: ['NEW', 'WAITING_REVIEW', 'SENT', 'AWAITING_FEEDBACK'] } },
    orderBy: [{ overallScore: 'desc' }, { candidateId: 'asc' }],
    include: { candidate: true, customer: true },
    take: 200,
  });

  const item = (m: (typeof matches)[number]) => ({
    id: m.id,
    overallScore: m.overallScore,
    status: m.status,
    strengths: m.strengths,
    concerns: m.concerns,
    candidate: serializeCustomerSummary(m.candidate),
    client: serializeCustomerSummary(m.customer),
    createdAt: m.createdAt,
  });

  return {
    NEW: matches.filter((m) => m.status === 'NEW').map(item),
    WAITING_REVIEW: matches.filter((m) => m.status === 'WAITING_REVIEW').map(item),
    SENT: matches.filter((m) => m.status === 'SENT').map(item),
    AWAITING_FEEDBACK: matches.filter((m) => m.status === 'AWAITING_FEEDBACK').map(item),
  };
}
