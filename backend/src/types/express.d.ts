import 'express';
import type { JwtPayload } from '../lib/jwt';

declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth middleware. */
      matchmaker?: JwtPayload;
    }
  }
}

export {};
