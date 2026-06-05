import { PrismaClient, type FunnelStage } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateMatches } from '../../src/services/matchEngine/matchEngine.service';
import { BASE_DATE, generateProfiles } from './generateProfiles';
import { NOTE_TEMPLATES } from './pools';

const prisma = new PrismaClient();

// Weighted funnel distribution across 200 customers (sums to 200).
const STAGE_PLAN: { stage: FunnelStage; count: number }[] = [
  { stage: 'PROFILE_REVIEW', count: 30 },
  { stage: 'VERIFIED', count: 30 },
  { stage: 'ACTIVE_SEARCH', count: 45 },
  { stage: 'POTENTIAL_MATCH_FOUND', count: 30 },
  { stage: 'INTRODUCTION_SENT', count: 20 },
  { stage: 'FIRST_CALL_SCHEDULED', count: 15 },
  { stage: 'DATING', count: 12 },
  { stage: 'RELATIONSHIP', count: 8 },
  { stage: 'ENGAGED', count: 6 },
  { stage: 'MARRIED', count: 4 },
];

// Stages at/after which a customer should have generated matches.
const MATCHABLE_STAGES: FunnelStage[] = [
  'ACTIVE_SEARCH',
  'POTENTIAL_MATCH_FOUND',
  'INTRODUCTION_SENT',
  'FIRST_CALL_SCHEDULED',
  'DATING',
  'RELATIONSHIP',
  'ENGAGED',
  'MARRIED',
];
const SUCCESS_STAGES: FunnelStage[] = ['RELATIONSHIP', 'ENGAGED', 'MARRIED'];

function daysAgo(days: number): Date {
  return new Date(BASE_DATE.getTime() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log('🌱 Seeding TDC Matchmaker OS...');

  // 1. Clean existing data (dependency order) for a stable, idempotent seed.
  await prisma.matchFeedback.deleteMany();
  await prisma.match.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.note.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.matchmaker.deleteMany();

  // 2. Demo matchmaker.
  const matchmaker = await prisma.matchmaker.create({
    data: {
      email: 'matchmaker@tdc.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Aarohi Kapoor',
    },
  });
  console.log('   ✓ Demo matchmaker created');

  // 3. Generate profiles and interleave genders for a mixed funnel.
  const males = generateProfiles('MALE', 100, 0x7d_c001);
  const females = generateProfiles('FEMALE', 100, 0x7d_c002);
  const interleaved: typeof males = [];
  for (let i = 0; i < 100; i++) {
    interleaved.push(males[i], females[i]);
  }

  // Expand stage plan into a 200-length array.
  const stages: FunnelStage[] = [];
  for (const { stage, count } of STAGE_PLAN) {
    for (let i = 0; i < count; i++) stages.push(stage);
  }

  // 4. Create customers with stage, verification, backdated createdAt.
  const created: { id: string; gender: 'MALE' | 'FEMALE'; stage: FunnelStage; index: number }[] =
    [];

  for (let i = 0; i < interleaved.length; i++) {
    const profile = interleaved[i];
    const stage = stages[i] ?? 'PROFILE_REVIEW';
    const stageIdx = STAGE_PLAN.findIndex((s) => s.stage === stage);

    // Later stages are fully verified; earlier ones bucketed.
    const lateStage = stageIdx >= 2;
    const emailVerified = lateStage || i % 10 < 7; // ~70%
    const phoneVerified = lateStage || i % 20 < 11; // ~55%

    // Backdate creation: later-stage clients have been in the journey longer.
    const ageDays = 20 + stageIdx * 28 + (i % 15);
    const matchActivityScore = Math.min(100, stageIdx * 9 + (i % 12));

    const customer = await prisma.customer.create({
      data: {
        ...profile.data,
        currentStage: stage,
        emailVerified,
        phoneVerified,
        assignedMatchmakerId: matchmaker.id,
        matchActivityScore,
        lastInteractionDate: daysAgo(Math.max(1, (i % 14) + stageIdx)),
        createdAt: daysAgo(ageDays),
      },
    });

    created.push({ id: customer.id, gender: profile.data.gender, stage, index: i });

    // Profile-created + verification timeline events (backdated).
    await prisma.timelineEvent.create({
      data: {
        customerId: customer.id,
        type: 'PROFILE_CREATED',
        description: 'Profile created and added to the roster',
        createdAt: daysAgo(ageDays),
      },
    });
    if (emailVerified && phoneVerified) {
      await prisma.timelineEvent.create({
        data: {
          customerId: customer.id,
          type: 'VERIFICATION',
          description: 'Email and phone verified — profile badge granted',
          createdAt: daysAgo(ageDays - 2),
        },
      });
    }
  }
  console.log(`   ✓ ${created.length} customers created (100 male, 100 female)`);

  // 5. Notes + a discovery-call timeline event for every 3rd customer.
  let noteCount = 0;
  for (const c of created) {
    if (c.index % 3 !== 0) continue;
    const n1 = NOTE_TEMPLATES[c.index % NOTE_TEMPLATES.length];
    const n2 = NOTE_TEMPLATES[(c.index + 4) % NOTE_TEMPLATES.length];
    await prisma.note.create({
      data: {
        customerId: c.id,
        authorId: matchmaker.id,
        category: n1.category as never,
        content: n1.content,
        createdAt: daysAgo(10 + (c.index % 20)),
      },
    });
    if (c.index % 6 === 0) {
      await prisma.note.create({
        data: {
          customerId: c.id,
          authorId: matchmaker.id,
          category: n2.category as never,
          content: n2.content,
          createdAt: daysAgo(6 + (c.index % 15)),
        },
      });
    }
    await prisma.timelineEvent.create({
      data: {
        customerId: c.id,
        type: 'CALL_SCHEDULED',
        description: 'Discovery call completed with the client',
        createdAt: daysAgo(12 + (c.index % 18)),
      },
    });
    noteCount++;
  }
  console.log(`   ✓ Notes & call events added for ${noteCount} clients`);

  // 6. Generate real matches (via the engine) for matchable-stage clients.
  const matchable = created.filter((c) => MATCHABLE_STAGES.includes(c.stage));
  for (const c of matchable) {
    await generateMatches(prisma, c.id, { emitTimeline: false });
  }
  console.log(`   ✓ Matches generated for ${matchable.length} clients`);

  // 7. Workflow states: give the queue realistic SENT / AWAITING / WAITING rows.
  const introStageClients = created.filter((c) =>
    ['INTRODUCTION_SENT', 'FIRST_CALL_SCHEDULED', 'DATING'].includes(c.stage)
  );
  for (const c of introStageClients) {
    const top = await prisma.match.findMany({
      where: { customerId: c.id },
      orderBy: [{ overallScore: 'desc' }, { candidateId: 'asc' }],
      take: 3,
    });
    if (top[0]) {
      await prisma.match.update({
        where: { id: top[0].id },
        data: { status: 'AWAITING_FEEDBACK' },
      });
      await prisma.timelineEvent.create({
        data: {
          customerId: c.id,
          type: 'INTRODUCTION_SENT',
          description: 'Introduction shared with the client',
          createdAt: daysAgo(5 + (c.index % 10)),
        },
      });
    }
    if (top[1]) {
      await prisma.match.update({ where: { id: top[1].id }, data: { status: 'SENT' } });
    }
    if (top[2]) {
      await prisma.match.update({ where: { id: top[2].id }, data: { status: 'WAITING_REVIEW' } });
    }
  }

  // 8. Success stories: top match ACCEPTED + positive feedback for success-stage clients.
  const successClients = created.filter((c) => SUCCESS_STAGES.includes(c.stage));
  let storyCount = 0;
  for (const c of successClients) {
    const top = await prisma.match.findFirst({
      where: { customerId: c.id },
      orderBy: [{ overallScore: 'desc' }, { candidateId: 'asc' }],
    });
    if (!top) continue;
    await prisma.match.update({ where: { id: top.id }, data: { status: 'ACCEPTED' } });
    await prisma.matchFeedback.create({
      data: {
        matchId: top.id,
        response: c.stage === 'MARRIED' ? 'DATE_SCHEDULED' : 'INTERESTED',
        notes: 'Strong mutual interest — progressing well.',
        createdAt: daysAgo(4 + (c.index % 8)),
      },
    });
    await prisma.timelineEvent.create({
      data: {
        customerId: c.id,
        type: 'FEEDBACK_RECEIVED',
        description: `Reached ${c.stage} stage 🎉`.replace(' 🎉', ''),
        createdAt: daysAgo(3 + (c.index % 6)),
      },
    });
    storyCount++;
  }
  console.log(`   ✓ ${storyCount} success stories created`);

  const totals = {
    customers: await prisma.customer.count(),
    matches: await prisma.match.count(),
    notes: await prisma.note.count(),
    timeline: await prisma.timelineEvent.count(),
    feedback: await prisma.matchFeedback.count(),
  };
  console.log('\n✅ Seed complete:', totals);
  console.log('   Login: matchmaker@tdc.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
