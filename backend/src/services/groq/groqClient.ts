import Groq from 'groq-sdk';
import { env } from '../../config/env';
import { AppError } from '../../errors/AppError';

export const GROQ_MODEL = 'llama-3.3-70b-versatile';

let client: Groq | null = null;

/** Whether a Groq key is configured (used by /health). */
export function hasGroqKey(): boolean {
  return Boolean(env.GROQ_API_KEY);
}

/** Lazily instantiate the Groq SDK. Throws 503 if no key is configured. */
export function getGroqClient(): Groq {
  if (!env.GROQ_API_KEY) {
    throw AppError.aiUnavailable(
      'GROQ_API_KEY is not configured. Add it to the backend .env to enable AI features.'
    );
  }
  if (!client) client = new Groq({ apiKey: env.GROQ_API_KEY });
  return client;
}

interface CallOpts {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Shared chat-completion call with one retry on 429/5xx. Returns trimmed
 * content. Maps SDK/network failures to AppError (502/503).
 */
export async function callGroq(opts: CallOpts): Promise<string> {
  const groq = getGroqClient();
  const { system, user, temperature = 0.4, maxTokens = 700, json = false } = opts;

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        temperature,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      });
      const content = completion.choices[0]?.message?.content?.trim();
      if (!content) throw AppError.upstream('Empty response from AI model');
      return content;
    } catch (err) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      // Retry once on rate-limit / transient server errors.
      if (attempt === 0 && (status === 429 || (status && status >= 500))) {
        await sleep(600);
        continue;
      }
      break;
    }
  }

  if (lastErr instanceof AppError) throw lastErr;
  const status = (lastErr as { status?: number })?.status;
  if (status === 401) throw AppError.aiUnavailable('Invalid GROQ_API_KEY');
  throw AppError.upstream(
    `AI request failed${status ? ` (status ${status})` : ''}. Please try again.`
  );
}
