import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { AppError } from '../errors/AppError';

type Source = 'body' | 'query' | 'params';

/**
 * Validation middleware factory. Parses the chosen request source against a
 * Zod schema and replaces it with the parsed (typed/coerced) value.
 */
export function validate(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      // Store the parsed (coerced/typed) value. We avoid reassigning req.query
      // (read-only getter in some Express setups) and expose it on a side key.
      if (source === 'body') {
        req.body = parsed;
      } else {
        (req as unknown as Record<string, unknown>)[`validated_${source}`] = parsed;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        next(AppError.badRequest('Validation failed', details));
      } else {
        next(err);
      }
    }
  };
}
