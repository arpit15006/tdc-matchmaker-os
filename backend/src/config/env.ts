import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Environment is validated once at boot. DATABASE_URL and JWT_SECRET are
 * required (fail fast). GROQ_API_KEY is optional here — the app boots without
 * it, and AI routes return 503 until it is configured (checked lazily in the
 * groq client).
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GROQ_API_KEY: z.string().optional(),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    '\n❌ Invalid environment configuration:\n' +
      parsed.error.issues
        .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
        .join('\n') +
      '\n\nCopy .env.example to .env and fill in the values.\n'
  );
  process.exit(1);
}

export const env = parsed.data;

/** Allowed CORS origins, parsed from the comma-separated CLIENT_ORIGIN. */
export const allowedOrigins = env.CLIENT_ORIGIN.split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const isProd = env.NODE_ENV === 'production';
