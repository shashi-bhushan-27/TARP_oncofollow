// =============================================
// Asha's voice for tap-to-talk mode — Sarvam Bulbul v3 text-to-speech
// =============================================
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech';
const SUPPORTED = ['hi-IN', 'bn-IN', 'ta-IN', 'te-IN', 'kn-IN', 'ml-IN', 'mr-IN', 'gu-IN', 'pa-IN', 'od-IN', 'en-IN'];
const SPEAKER = process.env.ASHA_SARVAM_SPEAKER || 'kavya';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'SARVAM_API_KEY is not configured.' }, { status: 500 });
    }
    const { text, language } = await req.json();
    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ success: false, error: 'Nothing to say.' }, { status: 400 });
    }
    const lang = SUPPORTED.find(l => l.toLowerCase() === String(language || '').toLowerCase()) ?? 'en-IN';

    const res = await fetch(SARVAM_TTS_URL, {
      method: 'POST',
      headers: { 'api-subscription-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.slice(0, 2400),
        target_language_code: lang,
        speaker: SPEAKER,
        model: 'bulbul:v3',
        pace: 0.95,
      }),
    });
    const data = await res.json().catch(() => null);
    const audio = data?.audios?.[0];
    if (!res.ok || !audio) {
      console.error('Sarvam TTS error:', res.status, data);
      return NextResponse.json({ success: false, error: 'Asha could not speak right now.' }, { status: 502 });
    }

    return new NextResponse(Buffer.from(audio, 'base64'), {
      headers: { 'Content-Type': 'audio/wav', 'Cache-Control': 'no-store' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Speech failed';
    console.error('Asha speak error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
