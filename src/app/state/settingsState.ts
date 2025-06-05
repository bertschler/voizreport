import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Voice mode types
export type VoiceMode = 'guided' | 'freeform';

export interface VoiceModeOption {
  value: VoiceMode;
  label: string;
  description: string;
}

export const VOICE_MODE_OPTIONS: VoiceModeOption[] = [
  {
    value: 'guided',
    label: 'Help me filling out the form',
    description: 'AI guides you through each field step by step'
  },
  {
    value: 'freeform',
    label: 'Let me do most talking',
    description: 'Speak freely, AI extracts information automatically'
  }
];

// Settings atoms with localStorage persistence
export const userNameAtom = atomWithStorage<string>('voizreport_username', '');
export const voiceModeAtom = atomWithStorage<VoiceMode>('voizreport_voice_mode', 'guided');

// Derived atom for getting current voice mode option
export const currentVoiceModeOptionAtom = atom(
  (get) => {
    const currentMode = get(voiceModeAtom);
    return VOICE_MODE_OPTIONS.find(option => option.value === currentMode) || VOICE_MODE_OPTIONS[0];
  }
);

// Action atom for updating voice mode
export const setVoiceModeAtom = atom(
  null,
  (get, set, mode: VoiceMode) => {
    set(voiceModeAtom, mode);
    console.log('🎙️ Voice mode updated:', mode);
  }
);

// Action atom for updating user name
export const setUserNameAtom = atom(
  null,
  (get, set, name: string) => {
    set(userNameAtom, name);
    console.log('👤 User name updated:', name);
  }
); 