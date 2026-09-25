import { AshaState } from '@/lib/asha/slots';

export type AshaStatus = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'ended' | 'error';

export interface AshaLine {
  id: string;
  who: 'asha' | 'person';
  text: string;
  final: boolean;
}

export interface AshaCallbacks {
  /** Emergency words heard — stop and show the emergency screen */
  onEmergency: (whatWasSaid: string, state: AshaState, lines: AshaLine[], reviewFlags: string[]) => void;
  /** Conversation finished normally — show the summary */
  onFinished: (state: AshaState, lines: AshaLine[], reviewFlags: string[]) => void;
}

export interface AshaSession {
  status: AshaStatus;
  lines: AshaLine[];
  state: AshaState;
  level: number;          // mic input level 0–1 (live) for the listening indicator
  muted: boolean;
  error: string | null;
  start: () => Promise<void>;
  finish: () => void;     // "That's enough for now"
  cancel: () => void;     // stop without submitting (switching modes)
  toggleMute: () => void;
}
