import OpenAI from 'openai';
import { env } from '@config/env';
import { logger } from '@utils/logger';
import { ApiError } from '@utils/ApiError';

/**
 * Every AI feature (resume analysis, question generation, answer scoring -
 * built in the AI Interview / Resume Analyzer modules) calls THIS client,
 * never the OpenAI SDK directly. That gives us one place to:
 *   - swap providers (Anthropic, local model) without touching feature code
 *   - enforce JSON-mode + schema validation on every structured call
 *   - add retries, timeouts, and cost logging centrally
 */
const client = new OpenAI({ apiKey: env.openai.apiKey });

interface JsonCompletionParams {
  system: string;
  user: string;
  temperature?: number;
}

export async function getJsonCompletion<T>(params: JsonCompletionParams): Promise<T> {
  if (!env.openai.apiKey) {
    throw ApiError.internal('OPENAI_API_KEY is not configured');
  }
  try {
    const completion = await client.chat.completions.create({
      model: env.openai.model,
      temperature: params.temperature ?? 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: params.system },
        { role: 'user', content: params.user },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty completion content');
    return JSON.parse(content) as T;
  } catch (err) {
    logger.error('OpenAI completion failed', { error: (err as Error).message });
    throw ApiError.internal('AI service is temporarily unavailable, please try again');
  }
}
