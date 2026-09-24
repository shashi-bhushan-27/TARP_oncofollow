// =============================================
// Live Asha — end-of-call backup extraction
// Reads the whole transcript once more and returns what the person said, so any
// detail a live tool call missed can still fill an empty field. Tool-call values
// always win; this pass only fills gaps.
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { groqChat } from '@/lib/groqChat';
import { normalizeDetail, normalizeSymptom, DURATIONS } from '@/lib/asha/normalize';
import { SYMPTOM_DEFINITIONS } from '@/types';

export const dynamic = 'force-dynamic';

const SYSTEM = `You read a conversation between Asha (a follow-up companion) and a person in cancer follow-up care (or their caregiver).
Extract ONLY what the person explicitly said. Never infer, never add medical judgement. Translate to English.
Reply ONLY with JSON:
{
  "symptoms": [{"symptom": "${SYMPTOM_DEFINITIONS.map(d => d.name).join(' | ')}", "severity": "mild|moderate|severe", "duration": "${DURATIONS.join('|')}", "frequency": "occasional|frequent|constant", "trend": "improving|stable|worsening"}],
  "other_symptoms": ["things they noticed that are not in the list"],
  "notes": ["other things they want the care team to know, including any questions they asked"]
}
Omit any field they did not state.`;

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json() as { transcript: { who: 'asha' | 'person'; text: string }[] };
    const text = (transcript ?? [])
      .filter(t => t.text?.trim())
      .map(t => `${t.who === 'asha' ? 'ASHA' : 'PERSON'}: ${t.text.trim()}`)
      .join('\n')
      .slice(-12000);
    if (!text) return NextResponse.json({ success: true, symptoms: [], otherSymptoms: [], notes: [] });

    const raw = await groqChat([{ role: 'system', content: SYSTEM }, { role: 'user', content: text }], { json: true, maxTokens: 1500, temperature: 0 });
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
    } catch {
      parsed = {};
    }
    const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x.trim()) : []);

    return NextResponse.json({
      success: true,
      symptoms: (Array.isArray(parsed.symptoms) ? parsed.symptoms : [])
        .map((s: Record<string, unknown>) => ({ symptom: normalizeSymptom(s?.symptom), detail: normalizeDetail(s ?? {}) }))
        .filter(s => s.symptom),
      otherSymptoms: strings(parsed.other_symptoms),
      notes: strings(parsed.notes),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Extraction failed';
    console.error('Asha extract error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
