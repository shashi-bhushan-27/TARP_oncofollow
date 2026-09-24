// =============================================
// Asha (tap-to-talk) — one conversational turn
//   1. Safety: emergency keywords are checked in code before any model sees the message
//   2. Listen: a small model extracts what was said (symptoms, language, feelings, stop/confirm)
//   3. Plan: code decides the next move (src/lib/asha/flow.ts)
//   4. Reply: the main model says it, warmly, in the person's language
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { demoUsers, getPatientForUser } from '@/data/demoData';
import { scanForRedFlags, sanitizeOutput, checkAshaSpeech } from '@/lib/safety';
import { groqChat } from '@/lib/groqChat';
import { buildListenInstructions, buildTextReplyInstructions } from '@/lib/asha/prompt';
import { AshaState, addNote, addOtherSymptom, mergeSymptom } from '@/lib/asha/slots';
import { AshaFlow, planNextMove } from '@/lib/asha/flow';
import { normalizeDetail, normalizeSymptom } from '@/lib/asha/normalize';

export const dynamic = 'force-dynamic';

type Turn = { role: 'user' | 'assistant'; content: string };

const LISTEN_MODELS = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b'];

function parseJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, messages, state, flow } = await req.json() as {
      userId: string; messages: Turn[]; state: AshaState; flow: AshaFlow;
    };
    const user = demoUsers.find(u => u.id === userId);
    const patient = getPatientForUser(user ?? null);
    if (!user || !patient) {
      return NextResponse.json({ success: false, error: 'Asha is available to patients and caregivers only.' }, { status: 403 });
    }

    // 1. Safety first, in code
    const latest = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
    if (scanForRedFlags(latest).isEmergency) {
      return NextResponse.json({ success: true, emergency: true, trigger: latest });
    }

    // 2. Listen
    const previousAsha = [...messages].reverse().find(m => m.role === 'assistant')?.content ?? '';
    const heard = parseJson(await groqChat([
      { role: 'system', content: buildListenInstructions() },
      { role: 'user', content: `Previous companion message: ${previousAsha || '(none)'}\nLatest message: ${latest}` },
    ], { json: true, maxTokens: 700, temperature: 0, models: LISTEN_MODELS }));

    let next = state;
    let newInfo = false;
    for (const s of Array.isArray(heard.symptoms) ? heard.symptoms : []) {
      const name = normalizeSymptom((s as Record<string, unknown>)?.symptom);
      if (!name) continue;
      next = mergeSymptom(next, name, normalizeDetail(s as Record<string, unknown>));
      newInfo = true;
    }
    for (const o of Array.isArray(heard.other_symptoms) ? heard.other_symptoms : []) {
      if (typeof o === 'string' && o.trim()) { next = addOtherSymptom(next, o); newInfo = true; }
    }
    if (typeof heard.note === 'string' && heard.note.trim()) { next = addNote(next, heard.note); newInfo = true; }

    // 3. Plan
    const plan = planNextMove(next, flow, {
      newInfo,
      strongEmotion: heard.strong_emotion === true,
      wantsToStop: heard.wants_to_stop === true,
      affirmed: heard.affirmed === true,
      nothingMore: heard.nothing_more === true,
    });

    // 4. Reply
    const isCaregiver = user.role === 'caregiver';
    const language = typeof heard.language === 'string' ? heard.language : 'en-IN';
    const languageName = typeof heard.language_name === 'string' ? heard.language_name : 'English';
    const system = buildTextReplyInstructions({
      speakerName: user.name,
      patientName: patient.user.name,
      isCaregiver,
      relationship: isCaregiver ? patient.emergencyContact.relationship : undefined,
      preferredLanguage: patient.preferredLanguage,
      treatmentCenter: patient.treatmentCenter,
    }, plan.instruction, languageName);

    const raw = await groqChat([{ role: 'system', content: system }, ...messages.slice(-10)], { maxTokens: 600, temperature: 0.6 });
    const reply = sanitizeOutput(raw.replace(/^["']|["']$/g, '').trim() || 'Sorry, I missed that. Could you tell me again?');
    const speech = checkAshaSpeech(reply);

    return NextResponse.json({
      success: true,
      reply: speech.critical
        ? 'That is exactly the kind of question for your care team, and I will make sure they see it. Is there anything else you have noticed?'
        : reply,
      language,
      state: next,
      flow: plan.flow,
      done: plan.done,
      toneFlag: speech.tone ?? speech.critical ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Asha could not reply';
    console.error('Asha chat error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
