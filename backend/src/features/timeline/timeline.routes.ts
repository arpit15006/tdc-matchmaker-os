import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { prisma } from '../../lib/prisma';

// Mounted at /api/customers/:id/timeline.
const router = Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const events = await prisma.timelineEvent.findMany({
      where: { customerId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(events);
  })
);

export default router;
