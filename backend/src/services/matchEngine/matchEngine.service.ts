import type { Customer, PrismaClient } from '@prisma/client';
import { scoreCompatibility, type CompatibilityResult } from '../compatibility/compatibility.service';

export interface RankedCandidate {
  candidate: Customer;
  result: CompatibilityResult;
}

const TOP_N = 10;

/** Candidate pool excludes the opposite-stage outcomes we shouldn't re-match. */
const EXCLUDED_CANDIDATE_STAGES = ['ENGAGED', 'MARRIED'] as const;

/**
 * Score every opposite-gender candidate for a client and return the Top 10,
 * ranked by overall score (desc), tie-broken by candidate id (asc) so the
 * ranking is fully deterministic for a given DB state.
 */
export function rankCandidates(client: Customer, pool: Customer[]): RankedCandidate[] {
  const ranked = pool
    .filter((c) => c.id !== client.id && c.gender !== client.gender)
    .map((candidate) => ({ candidate, result: scoreCompatibility(client, candidate) }));

  ranked.sort((a, b) => {
    if (b.result.overallScore !== a.result.overallScore) {
      return b.result.overallScore - a.result.overallScore;
    }
    return a.candidate.id < b.candidate.id ? -1 : a.candidate.id > b.candidate.id ? 1 : 0;
  });

  return ranked.slice(0, TOP_N);
}

/**
 * Generate and persist the Top 10 matches for a client. Idempotent: re-running
 * upserts the same rows (unique customerId+candidateId), so the stored set
 * stays stable. Emits a MATCH_GENERATED timeline event.
 */
export async function generateMatches(
  prisma: PrismaClient,
  clientId: string,
  opts: { emitTimeline?: boolean } = {}
): Promise<RankedCandidate[]> {
  const client = await prisma.customer.findUnique({ where: { id: clientId } });
  if (!client) throw new Error(`Customer ${clientId} not found`);

  const pool = await prisma.customer.findMany({
    where: {
      gender: client.gender === 'MALE' ? 'FEMALE' : 'MALE',
      currentStage: { notIn: [...EXCLUDED_CANDIDATE_STAGES] },
      id: { not: client.id },
    },
  });

  const ranked = rankCandidates(client, pool);

  for (const { candidate, result } of ranked) {
    await prisma.match.upsert({
      where: {
        customerId_candidateId: { customerId: client.id, candidateId: candidate.id },
      },
      create: {
        customerId: client.id,
        candidateId: candidate.id,
        overallScore: result.overallScore,
        breakdown: result.breakdown,
        strengths: result.strengths,
        concerns: result.concerns,
        status: 'NEW',
      },
      update: {
        overallScore: result.overallScore,
        breakdown: result.breakdown,
        strengths: result.strengths,
        concerns: result.concerns,
      },
    });
  }

  if (opts.emitTimeline !== false && ranked.length > 0) {
    await prisma.timelineEvent.create({
      data: {
        customerId: client.id,
        type: 'MATCH_GENERATED',
        description: `Generated ${ranked.length} recommended matches`,
        metadata: { count: ranked.length, topScore: ranked[0]?.result.overallScore },
      },
    });
  }

  return ranked;
}
