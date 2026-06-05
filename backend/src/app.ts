import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { allowedOrigins } from './config/env';
import { prisma } from './lib/prisma';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { hasGroqKey } from './services/groq/groqClient';

// Feature routers
import authRouter from './features/auth/auth.routes';
import customersRouter from './features/customers/customers.routes';
import { notesRouter } from './features/notes/notes.routes';
import { matchesRouter } from './features/matches/matches.routes';
import dashboardRouter, { successStoriesRouter } from './features/dashboard/dashboard.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser tools (no origin) and any configured origin.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  // Health check (public).
  app.get('/api/health', async (_req, res) => {
    let db = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch {
      db = false;
    }
    res.json({ status: 'ok', db, ai: hasGroqKey() });
  });

  // Mount features.
  app.use('/api/auth', authRouter);
  app.use('/api/customers', customersRouter);
  app.use('/api/notes', notesRouter);
  app.use('/api/matches', matchesRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/success-stories', successStoriesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
