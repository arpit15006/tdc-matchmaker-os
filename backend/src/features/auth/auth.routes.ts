import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth } from '../../middleware/requireAuth';
import { validate } from '../../middleware/validate';
import { loginSchema } from './auth.schema';
import * as authService from './auth.service';

const router = Router();

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.json(result);
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const matchmaker = await authService.getMatchmakerById(req.matchmaker!.sub);
    res.json({ matchmaker });
  })
);

export default router;
