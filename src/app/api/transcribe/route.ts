// =============================================
// OncoFollow — Sarvam AI Speech-to-Text-Translate Route
// Accepts a short voice note in any supported Indic language (or English).
// Default: returns an English transcript. With mode=transcribe (used by Asha),
// returns the words in the language they were spoken. Keeps SARVAM_API_KEY on the server.
// =============================================
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SARVAM_TRANSLATE_URL = 'https://api.sarvam.ai/speech-to-text-translate';
const SARVAM_TRANSCRIBE_URL = 'https://api.sarvam.ai/speech-to-text';
// saaras:v1 is deprecated (the API rejects it and points to saaras:v3)
const SARVAM_MODEL = process.env.SARVAM_STT_MODEL || 'saaras:v3';
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'SARVAM_API_KEY environment variable is not configured.' },
        { status: 500 }
      );
    }

    const incoming = await req.formData();
    const audio = incoming.get('file');
    if (!(audio instanceof Blob) || audio.size === 0) {
      return NextResponse.json(
        { success: false, error: 'No audio received. Please record again.' },
        { status: 400 }
      );
    }
    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Recording is too large. Please keep voice notes under 30 seconds.' },
        { status: 413 }
      );
    }

    const fileName = audio instanceof File && audio.name ? audio.name : 'voice-note.webm';
    // Browsers label recordings like "audio/webm;codecs=opus"; Sarvam only accepts the bare type
    const mimeType = audio.type.split(';')[0].trim() || 'audio/webm';
    const cleanAudio = new Blob([await audio.arrayBuffer()], { type: mimeType });
    const keepLanguage = incoming.get('mode') === 'transcribe';
    const form = new FormData();
    form.append('file', cleanAudio, fileName);
    form.append('model', SARVAM_MODEL);
    if (keepLanguage) {
      form.append('mode', 'transcribe');
      form.append('language_code', 'unknown');
    }

    const res = await fetch(keepLanguage ? SARVAM_TRANSCRIBE_URL : SARVAM_TRANSLATE_URL, {
      method: 'POST',
      headers: { 'api-subscription-key': apiKey },
      body: form,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error('Sarvam STT error:', res.status, data);
      const detail = data?.error?.message || data?.message || `Sarvam API returned ${res.status}`;
      return NextResponse.json({ success: false, error: detail }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      transcript: (data?.transcript as string | undefined)?.trim() || '',
      languageCode: data?.language_code ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Transcribe route error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
