// =============================================
// Asha — language-independent safety review (server only)
// The keyword lists in src/lib/safety.ts are the fast first line. This model-based
// check covers any language and any wording they miss:
//   - the person's words: is an emergency sign being described?
//   - Asha's words: did she diagnose, advise on tests/treatment, or falsely reassure?
// =============================================
import { groqChat } from '@/lib/groqChat';
import { EMERGENCY_SIGNS, checkAshaSpeech, scanForRedFlags } from '@/lib/safety';

const SAFETY_MODELS = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b'];

function parseJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
  } catch {
    return {};
  }
}

/** Does this message (in any language) say one of the emergency signs is happening? */
export async function detectEmergency(text: string): Promise<{ emergency: boolean; reason?: string }> {
  if (!text.trim()) return { emergency: false };
  if (scanForRedFlags(text).isEmergency) return { emergency: true, reason: 'emergency keyword' };
  try {
    const raw = await groqChat([
      {
        role: 'system',
        content: `You check one message from a person in cancer follow-up care (it may be in any language, including Hindi, Marathi, Tamil, Bengali or Telugu).
Say whether it describes any of these emergency signs happening to them (or to the person they care for) now or very recently: ${EMERGENCY_SIGNS.join('; ')}.
Do not count a sign that is denied ("no chest pain"), hypothetical, or in the distant past.
Reply ONLY with JSON: {"emergency": true or false, "sign": "which sign, in English, or empty"}`,
      },
      { role: 'user', content: text.slice(0, 2000) },
    ], { json: true, maxTokens: 200, temperature: 0, models: SAFETY_MODELS });
    const r = parseJson(raw);
    return { emergency: r.emergency === true, reason: typeof r.sign === 'string' ? r.sign : undefined };
  } catch {
    // If the check itself fails, fall back to the keyword result (already negative)
    return { emergency: false };
  }
}

/** Review what Asha said (in any language) against the playbook's hard limits */
export async function reviewAshaReply(text: string): Promise<{ critical?: string; tone?: string }> {
  const quick = checkAshaSpeech(text);
  if (quick.critical || !text.trim()) return quick;
  try {
    const raw = await groqChat([
      {
        role: 'system',
        content: `You review one reply from Asha, a non-clinical companion in a cancer follow-up service. The reply may be in any language.
critical = the reply diagnoses, says what a symptom means, says whether cancer has or has not come back, recommends or discourages tests, scans, treatments, medicines or dose changes, interprets results, or says they do not need a doctor.
tone = the reply gives false reassurance ("it's probably nothing", "you'll be fine", "nothing to worry about") or forced positivity ("stay positive", "everything happens for a reason").
Telling someone to seek emergency care, or saying their care team will answer a question, is NOT critical.
Reply ONLY with JSON: {"critical": true or false, "tone": true or false, "reason": "short English explanation or empty"}`,
      },
      { role: 'user', content: text.slice(0, 2000) },
    ], { json: true, maxTokens: 200, temperature: 0, models: SAFETY_MODELS });
    const r = parseJson(raw);
    const reason = typeof r.reason === 'string' && r.reason.trim() ? r.reason.trim() : 'flagged by safety review';
    return {
      critical: r.critical === true ? reason : undefined,
      tone: quick.tone ?? (r.tone === true ? reason : undefined),
    };
  } catch {
    return quick;
  }
}

/** True when the text contains letters outside basic Latin (e.g. Devanagari, Tamil, Bengali) */
export const isNonEnglishScript = (text: string) => /[^\x00-\x7F’‘“”—–…]/.test(text.replace(/[\s\d]/g, ''));
