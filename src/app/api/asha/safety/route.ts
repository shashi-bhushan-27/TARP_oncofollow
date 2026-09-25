// =============================================
// Live Asha — language-independent safety checks on each completed turn
//   kind "person": does the person describe an emergency sign (any language)?
//   kind "asha":   did Asha diagnose, advise on treatment, or falsely reassure?
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { detectEmergency, reviewAshaReply } from '@/lib/asha/safetyCheck';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { kind, text } = await req.json() as { kind: 'person' | 'asha'; text: string };
    if (typeof text !== 'string' || !text.trim()) return NextResponse.json({ success: true });
    if (kind === 'person') {
      return NextResponse.json({ success: true, ...(await detectEmergency(text)) });
    }
    return NextResponse.json({ success: true, ...(await reviewAshaReply(text)) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Safety check failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
