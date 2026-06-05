import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth } from '../../middleware/requireAuth';
import * as dashboardService from './dashboard.service';

const router = Router();
router.use(requireAuth);

router.get(
  '/kpis',
  asyncHandler(async (_req, res) => {
    res.json(await dashboardService.getKpis());
  })
);

router.get(
  '/funnel',
  asyncHandler(async (_req, res) => {
    res.json(await dashboardService.getFunnel());
  })
);

export default router;

// Standalone success-stories router (mounted at /api/success-stories).
export const successStoriesRouter = Router();
successStoriesRouter.use(requireAuth);
successStoriesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await dashboardService.getSuccessStories());
  })
);
