import { prisma } from '../../lib/prisma';
import {
  ACTIVE_STAGES,
  FUNNEL_ORDER,
  POST_INTRO_STAGES,
  STAGE_LABELS,
  SUCCESS_STAGES,
} from '../../config/constants';
import { serializeCustomerSummary } from '../../lib/serializers';

export async function getKpis() {
  const [
    totalClients,
    activeSearches,
    verifiedCount,
    matchesSent,
    introductionsSent,
    meetingsScheduled,
    relationships,
    engagements,
    marriages,
    postIntroCount,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { currentStage: { in: ACTIVE_STAGES } } }),
    prisma.customer.count({ where: { emailVerified: true, phoneVerified: true } }),
    prisma.match.count({ where: { status: { in: ['SENT', 'AWAITING_FEEDBACK', 'ACCEPTED', 'REJECTED'] } } }),
    prisma.customer.count({ where: { currentStage: { in: POST_INTRO_STAGES } } }),
    prisma.customer.count({ where: { currentStage: { in: ['FIRST_CALL_SCHEDULED', 'DATING', 'RELATIONSHIP', 'ENGAGED', 'MARRIED'] } } }),
    prisma.customer.count({ where: { currentStage: 'RELATIONSHIP' } }),
    prisma.customer.count({ where: { currentStage: 'ENGAGED' } }),
    prisma.customer.count({ where: { currentStage: 'MARRIED' } }),
    prisma.customer.count({ where: { currentStage: { in: POST_INTRO_STAGES } } }),
  ]);

  const successCount = relationships + engagements + marriages;
  const successRate = postIntroCount > 0 ? Math.round((successCount / postIntroCount) * 100) : 0;

  return {
    totalClients,
    activeSearches,
    verifiedCount,
    matchesSent,
    introductionsSent,
    meetingsScheduled,
    relationships,
    engagements,
    marriages,
    successRate,
  };
}

export async function getFunnel() {
  const grouped = await prisma.customer.groupBy({
    by: ['currentStage'],
    _count: { _all: true },
  });
  const counts = new Map(grouped.map((g) => [g.currentStage, g._count._all]));

  return FUNNEL_ORDER.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    count: counts.get(stage) ?? 0,
  }));
}

export async function getSuccessStories() {
  const [relationships, engagements, marriages, stories] = await Promise.all([
    prisma.customer.count({ where: { currentStage: 'RELATIONSHIP' } }),
    prisma.customer.count({ where: { currentStage: 'ENGAGED' } }),
    prisma.customer.count({ where: { currentStage: 'MARRIED' } }),
    prisma.customer.findMany({
      where: { currentStage: { in: SUCCESS_STAGES } },
      orderBy: { updatedAt: 'desc' },
      take: 24,
      include: {
        matchesAsClient: {
          where: { status: 'ACCEPTED' },
          orderBy: { overallScore: 'desc' },
          take: 1,
          include: { candidate: true },
        },
      },
    }),
  ]);

  // Average days from profile creation to reaching a success stage.
  // Reuse the `stories` result already fetched above — no extra DB round-trip needed.
  const avgDaysToMatch =
    stories.length > 0
      ? Math.round(
          stories.reduce((sum, c) => {
            const days = (c.updatedAt.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return sum + Math.max(0, days);
          }, 0) / stories.length
        )
      : 0;

  const successRate = (() => {
    const denomStages = POST_INTRO_STAGES;
    return prisma.customer
      .count({ where: { currentStage: { in: denomStages } } })
      .then((denom) =>
        denom > 0 ? Math.round(((relationships + engagements + marriages) / denom) * 100) : 0
      );
  })();

  return {
    relationships,
    engagements,
    marriages,
    successRate: await successRate,
    avgDaysToMatch,
    stories: stories.map((c) => ({
      client: serializeCustomerSummary(c),
      partner: c.matchesAsClient[0]?.candidate
        ? serializeCustomerSummary(c.matchesAsClient[0].candidate)
        : null,
      stage: c.currentStage,
      score: c.matchesAsClient[0]?.overallScore ?? null,
    })),
  };
}
