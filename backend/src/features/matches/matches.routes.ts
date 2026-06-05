import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth } from '../../middleware/requireAuth';
import { validate } from '../../middleware/validate';
import { matchExplanationHandler, matchIntroductionHandler } from '../ai/ai.routes';
import {
  feedbackSchema,
  sendMatchSchema,
  updateMatchStatusSchema,
} from './matches.schema';
import * as matchesService from './matches.service';

// ── /api/customers/:id/matches ───────────────────────────────────────
export const customerMatchesRouter = Router({ mergeParams: true });

customerMatchesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await matchesService.listForCustomer(req.params.id));
  })
);

customerMatchesRouter.post(
  '/generate',
  asyncHandler(async (req, res) => {
    res.json(await matchesService.generateForCustomer(req.params.id));
  })
);

// ── /api/matches ─────────────────────────────────────────────────────
export const matchesRouter = Router();
matchesRouter.use(requireAuth);

matchesRouter.get(
  '/queue',
  asyncHandler(async (_req, res) => {
    res.json(await matchesService.getQueue());
  })
);

matchesRouter.get(
  '/:matchId',
  asyncHandler(async (req, res) => {
    res.json(await matchesService.getMatch(req.params.matchId));
  })
);

matchesRouter.patch(
  '/:matchId/status',
  validate(updateMatchStatusSchema),
  asyncHandler(async (req, res) => {
    res.json(await matchesService.updateStatus(req.params.matchId, req.body.status));
  })
);

matchesRouter.post(
  '/:matchId/send',
  validate(sendMatchSchema),
  asyncHandler(async (req, res) => {
    res.json(await matchesService.sendMatch(req.params.matchId, req.body));
  })
);

matchesRouter.post(
  '/:matchId/feedback',
  validate(feedbackSchema),
  asyncHandler(async (req, res) => {
    const fb = await matchesService.addFeedback(req.params.matchId, req.body);
    res.status(201).json(fb);
  })
);

matchesRouter.get(
  '/:matchId/feedback',
  asyncHandler(async (req, res) => {
    res.json(await matchesService.listFeedback(req.params.matchId));
  })
);

// AI endpoints scoped to a match (handlers defined in the ai feature).
matchesRouter.post('/:matchId/explanation', asyncHandler(matchExplanationHandler));
matchesRouter.post('/:matchId/introduction', asyncHandler(matchIntroductionHandler));

export default matchesRouter;
