// =============================================
// Asha — browser audio
// Mic capture → 16 kHz PCM for Gemini Live, gapless playback of Asha's 24 kHz voice
// with instant stop on interruption, and an optional faint room tone.
// =============================================

// AudioWorklet that forwards raw mic samples to the main thread
const CAPTURE_WORKLET = `
class AshaCapture extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) this.port.postMessage(ch.slice(0));
    return true;
  }
}
registerProcessor('asha-capture', AshaCapture);
`;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

/** Linear-resample Float32 audio and encode as 16-bit little-endian PCM */
function toPcm16(input: Float32Array, fromRate: number, toRate: number): Uint8Array {
  const ratio = fromRate / toRate;
  const length = Math.floor(input.length / ratio);
  const out = new DataView(new ArrayBuffer(length * 2));
  for (let i = 0; i < length; i++) {
    const pos = i * ratio;
    const i0 = Math.floor(pos);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const sample = input[i0] + (input[i1] - input[i0]) * (pos - i0);
    const clamped = Math.max(-1, Math.min(1, sample));
    out.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  return new Uint8Array(out.buffer);
}

export interface MicCapture {
  stop: () => void;
  setMuted: (muted: boolean) => void;
}

/**
 * Start the microphone. Calls onChunk with ~100 ms of base64 16 kHz PCM,
 * and onLevel with a smoothed 0–1 input level for the listening indicator.
 */
export async function startMic(
  onChunk: (base64Pcm: string) => void,
  onLevel: (level: number) => void,
): Promise<MicCapture> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  const ctx = new AudioContext();
  const url = URL.createObjectURL(new Blob([CAPTURE_WORKLET], { type: 'application/javascript' }));
  await ctx.audioWorklet.addModule(url);
  URL.revokeObjectURL(url);

  const source = ctx.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(ctx, 'asha-capture');
  const sink = ctx.createGain();
  sink.gain.value = 0; // keep the node processing without playing the mic back
  source.connect(node);
  node.connect(sink).connect(ctx.destination);

  let muted = false;
  let pending: Float32Array[] = [];
  let pendingLength = 0;
  let level = 0;
  const chunkSamples = Math.round(ctx.sampleRate / 10); // ~100 ms

  node.port.onmessage = (e: MessageEvent<Float32Array>) => {
    const samples = e.data;
    let sum = 0;
    for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
    const rms = Math.sqrt(sum / samples.length);
    level = level * 0.8 + Math.min(1, rms * 6) * 0.2;
    onLevel(muted ? 0 : level);

    if (muted) return;
    pending.push(samples);
    pendingLength += samples.length;
    if (pendingLength >= chunkSamples) {
      const merged = new Float32Array(pendingLength);
      let offset = 0;
      for (const p of pending) { merged.set(p, offset); offset += p.length; }
      pending = [];
      pendingLength = 0;
      onChunk(bytesToBase64(toPcm16(merged, ctx.sampleRate, 16000)));
    }
  };

  return {
    stop: () => {
      node.port.onmessage = null;
      stream.getTracks().forEach(t => t.stop());
      ctx.close().catch(() => undefined);
    },
    setMuted: (m: boolean) => { muted = m; },
  };
}

/** Gapless playback of 24 kHz PCM chunks, with instant stop for barge-in */
export class VoicePlayer {
  private ctx: AudioContext;
  private out: GainNode;
  private nextStart = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private roomTone: AudioBufferSourceNode | null = null;
  private roomGain: GainNode | null = null;

  constructor() {
    this.ctx = new AudioContext();
    this.out = this.ctx.createGain();
    this.out.connect(this.ctx.destination);
  }

  async resume() {
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  /** True while Asha's voice is still playing */
  get isPlaying(): boolean {
    return this.ctx.currentTime < this.nextStart - 0.05;
  }

  enqueuePcm16(base64: string, sampleRate = 24000) {
    const bytes = base64ToBytes(base64);
    const view = new DataView(bytes.buffer);
    const frames = Math.floor(bytes.length / 2);
    if (!frames) return;
    const buffer = this.ctx.createBuffer(1, frames, sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) channel[i] = view.getInt16(i * 2, true) / 0x8000;

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.out);
    const startAt = Math.max(this.ctx.currentTime + 0.02, this.nextStart);
    src.start(startAt);
    this.nextStart = startAt + buffer.duration;
    this.sources.add(src);
    src.onended = () => this.sources.delete(src);
  }

  /** Stop immediately — used when the person starts talking over Asha */
  interrupt() {
    this.sources.forEach(s => { try { s.stop(); } catch { /* already stopped */ } });
    this.sources.clear();
    this.nextStart = this.ctx.currentTime;
  }

  /** A very faint, soft room tone so silence doesn't feel like a dead line. Off by default. */
  setRoomTone(on: boolean) {
    if (!on) {
      this.roomTone?.stop();
      this.roomTone = null;
      return;
    }
    if (this.roomTone) return;
    const seconds = 4;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * seconds, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; // brown noise: soft, low rumble
      data[i] = last * 3.5;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    this.roomGain = this.ctx.createGain();
    this.roomGain.gain.value = 0.012;
    src.connect(filter).connect(this.roomGain).connect(this.ctx.destination);
    src.start();
    this.roomTone = src;
  }

  close() {
    this.interrupt();
    this.setRoomTone(false);
    this.ctx.close().catch(() => undefined);
  }
}
