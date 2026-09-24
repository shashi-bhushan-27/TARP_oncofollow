// =============================================
// Live Asha — ephemeral token
// Mints a single-use Gemini Live token with Asha's model, voice, instructions and
// tools locked in, so the browser never sees the API key and cannot change what
// Asha is allowed to say or do.
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import {
  GoogleGenAI, Modality, StartSensitivity, EndSensitivity, LiveConnectConfig,
} from '@google/genai';
import { demoUsers, getPatientForUser } from '@/data/demoData';
import { buildLiveInstructions } from '@/lib/asha/prompt';
import { ASHA_TOOLS } from '@/lib/asha/tools';

export const dynamic = 'force-dynamic';

// Primary: Gemini 3.8 Live — in testing it followed language switches and tool rules most reliably.
// Fallback: 2.5 native audio with affective dialog (tone follows the patient's emotion).
const MODELS = [
  { model: process.env.ASHA_LIVE_MODEL || 'gemini-3.8-live', affective: false },
  { model: process.env.ASHA_LIVE_FALLBACK_MODEL || 'gemini-2.5-flash-native-audio-latest', affective: true },
];
const VOICE = process.env.ASHA_VOICE || 'Sulafat';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const { userId, attempt = 0 } = await req.json();
    const user = demoUsers.find(u => u.id === userId);
    const patient = getPatientForUser(user ?? null);
    if (!user || !patient) {
      return NextResponse.json({ success: false, error: 'Asha is available to patients and caregivers only.' }, { status: 403 });
    }

    const choice = MODELS[Math.min(Number(attempt) || 0, MODELS.length - 1)];
    const isCaregiver = user.role === 'caregiver';

    const config: LiveConnectConfig = {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
      systemInstruction: buildLiveInstructions({
        speakerName: user.name,
        patientName: patient.user.name,
        isCaregiver,
        relationship: isCaregiver ? patient.emergencyContact.relationship : undefined,
        preferredLanguage: patient.preferredLanguage,
        treatmentCenter: patient.treatmentCenter,
      }),
      tools: [{ functionDeclarations: ASHA_TOOLS }],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      // Stay quiet for background talk; give people time to pause and think
      proactivity: { proactiveAudio: true },
      realtimeInputConfig: {
        automaticActivityDetection: {
          startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
          endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
          prefixPaddingMs: 300,
          silenceDurationMs: 900,
        },
      },
      temperature: 0.7,
      ...(choice.affective ? { enableAffectiveDialog: true } : {}),
    };

    const ai = new GoogleGenAI({ apiKey });
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
        liveConnectConstraints: { model: choice.model, config },
        httpOptions: { apiVersion: 'v1alpha' },
      },
    });

    return NextResponse.json({
      success: true,
      token: token.name,
      model: choice.model,
      hasFallback: (Number(attempt) || 0) < MODELS.length - 1,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not start Asha';
    console.error('Asha token error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
