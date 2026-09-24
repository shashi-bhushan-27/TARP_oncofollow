// =============================================
// Groq chat with key + model fallback (free tier)
// Tries the primary model on each key, then the smaller free model.
// =============================================
import Groq from 'groq-sdk';

// Free-tier Groq models only (llama-3.3-70b-versatile has been retired).
const GROQ_MODELS = [
  process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
].filter((m, i, all) => all.indexOf(m) === i);

// Bad/revoked key, no model access, rate limit, or Groq-side outage
const RETRYABLE_STATUS = new Set([401, 403, 404, 429, 500, 502, 503]);

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function groqChat(
  messages: ChatMessage[],
  opts: { json?: boolean; maxTokens?: number; temperature?: number; models?: string[] } = {},
): Promise<string> {
  const apiKeys = [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_BACKUP]
    .filter((k): k is string => Boolean(k));
  if (apiKeys.length === 0) throw new Error('GROQ_API_KEY environment variable is not configured.');

  let lastError: unknown;
  for (const model of opts.models ?? GROQ_MODELS) {
    for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
      const client = new Groq({ apiKey: apiKeys[keyIndex], maxRetries: 0 });
      const create = (json: boolean) => client.chat.completions.create({
        model,
        messages,
        temperature: opts.temperature ?? 0.3,
        max_tokens: opts.maxTokens ?? 2048,
        reasoning_effort: 'low',
        ...(json ? { response_format: { type: 'json_object' as const } } : {}),
      });
      try {
        try {
          const completion = await create(!!opts.json);
          return completion.choices[0]?.message?.content || '';
        } catch (error: unknown) {
          if (!opts.json || !(error instanceof Groq.APIError) || error.status !== 400) throw error;
          const body = error.error as { error?: { code?: string; failed_generation?: string }; code?: string; failed_generation?: string } | undefined;
          const detail = body?.error ?? body;
          // The model sometimes wraps a correct JSON answer in a made-up tool call; unwrap it
          if (detail?.code === 'tool_use_failed' && detail.failed_generation) {
            try {
              const wrapped = JSON.parse(detail.failed_generation);
              if (wrapped?.arguments && typeof wrapped.arguments === 'object') return JSON.stringify(wrapped.arguments);
            } catch { /* fall through to a plain retry */ }
          }
          // Strict JSON mode sometimes rejects a good plain-text reply; ask once more without it
          if (detail?.code !== 'json_validate_failed' && detail?.code !== 'tool_use_failed') throw error;
          const completion = await create(false);
          return completion.choices[0]?.message?.content || '';
        }
      } catch (error: unknown) {
        lastError = error;
        const status = error instanceof Groq.APIError ? error.status : undefined;
        if (status === undefined || !RETRYABLE_STATUS.has(status)) throw error;
        console.warn(`Groq ${model} with ${keyIndex === 0 ? 'primary' : 'backup'} key failed (${status}); trying next option`);
      }
    }
  }
  throw lastError;
}
