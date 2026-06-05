import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { verifyToken } from '../lib/jwt';

/**
 * Verifies the Bearer token and attaches the decoded matchmaker to req.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing Authorization header'));
  }
  try {
    req.matchmaker = verifyToken(header.slice('Bearer '.length).trim());
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired token'));
  }
}
