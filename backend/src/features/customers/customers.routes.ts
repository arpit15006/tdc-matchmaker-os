import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth } from '../../middleware/requireAuth';
import { validate } from '../../middleware/validate';
import notesRouter from '../notes/notes.routes';
import timelineRouter from '../timeline/timeline.routes';
import { customerMatchesRouter } from '../matches/matches.routes';
import { customerInsightsRouter } from '../ai/ai.routes';
import { customerListQuerySchema, updateStageSchema } from './customers.schema';
import * as customersService from './customers.service';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  validate(customerListQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const result = await customersService.listCustomers(
      (req as unknown as { validated_query: ReturnType<typeof customerListQuerySchema.parse> })
        .validated_query
    );
    res.json(result);
  })
);

router.get(
  '/filter-options',
  asyncHandler(async (_req, res) => {
    res.json(await customersService.getFilterOptions());
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await customersService.getCustomerById(req.params.id));
  })
);

router.patch(
  '/:id/stage',
  validate(updateStageSchema),
  asyncHandler(async (req, res) => {
    res.json(await customersService.updateStage(req.params.id, req.body.stage));
  })
);

// Nested customer-scoped resources.
router.use('/:id/notes', notesRouter);
router.use('/:id/timeline', timelineRouter);
router.use('/:id/matches', customerMatchesRouter);
router.use('/:id/insights', customerInsightsRouter);

export default router;
