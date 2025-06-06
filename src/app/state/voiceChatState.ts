import { atom } from 'jotai';

// Core session state atoms
export const sessionIdAtom = atom<string | null>(null);
export const isSessionActiveAtom = atom<boolean>(false);
export const isConnectingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);

// Audio and transcript state atoms
export const transcriptAtom = atom<string>('');
export const aiResponseAtom = atom<string>('');
export const hasPermissionAtom = atom<boolean>(false);

// WebRTC connection atoms
export const peerConnectionAtom = atom<RTCPeerConnection | null>(null);
export const dataChannelAtom = atom<RTCDataChannel | null>(null);
export const allDataChannelsAtom = atom<RTCDataChannel[]>([]);
export const localStreamAtom = atom<MediaStream | null>(null);

// Session management atoms
export const currentSessionIdAtom = atom<string>('');
export const isStartingSessionAtom = atom<boolean>(false);

// Voice chat mode atoms
export type VoiceChatMode = 'report' | 'template-creation';
export const voiceChatModeAtom = atom<VoiceChatMode>('report');

// Form data atoms (for report mode)
export const formDataAtom = atom<Record<string, any>>({});
export const completedFieldsAtom = atom<Set<string>>(new Set<string>());

// Form progress tracking - constantly updated during conversation
export const formProgressAtom = atom<Record<string, any>>({});

// Template creation atoms (for template-creation mode)
export interface TemplateCreationProgress {
  title?: string;
  description?: string;
  definition?: string;
  icon?: string;
  fields?: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    enum?: string[];
  }>;
  currentPhase?: 'core-attributes' | 'field-definition' | 'review';
}

export const templateCreationProgressAtom = atom<TemplateCreationProgress>({});
export const isCreatingTemplateAtom = atom<boolean>(false);

// Template creation result atom
export interface CreatedTemplate {
  title: string;
  description: string;
  definition: string;
  icon: string;
  openai_properties: Record<string, any>;
  required_fields?: string[];
}

export const createdTemplateAtom = atom<CreatedTemplate | null>(null);

// Callbacks and configuration atoms
export interface VoiceChatCallbacks {
  onSessionReady?: (sessionId: string) => void;
  onFormCompleted?: (summary: FormSummary) => void;
  handleRealtimeMessage?: (message: any, sessionId?: string) => void;
}

export const callbacksAtom = atom<VoiceChatCallbacks>({});
export const templateInstructionsAtom = atom<string>('');

// Form summary interface (re-exported for convenience)
export interface FormSummary {
  plainText: string;
  json: Record<string, any>;
  timestamp: number;
}

// Derived atoms for computed state
export const isSessionReadyAtom = atom((get) => {
  const isActive = get(isSessionActiveAtom);
  const sessionId = get(sessionIdAtom);
  const isConnecting = get(isConnectingAtom);
  
  return isActive && sessionId && !isConnecting;
});

// Session tracking for preventing duplicates
const startedSessionsAtom = atom<Map<string, boolean>>(new Map());

// Current active template atom for session indicator
export const activeTemplateAtom = atom<any | null>(null);

// Selected template atom - triggers automatic session start
export const selectedTemplateAtom = atom<any | null>(null);

export const addStartedSessionAtom = atom(
  null,
  (get, set, sessionId: string) => {
    const sessions = new Map(get(startedSessionsAtom));
    sessions.set(sessionId, true);
    set(startedSessionsAtom, sessions);
  }
);

export const removeStartedSessionAtom = atom(
  null,
  (get, set, sessionId: string) => {
    const sessions = new Map(get(startedSessionsAtom));
    sessions.delete(sessionId);
    set(startedSessionsAtom, sessions);
  }
);

export const hasStartedSessionAtom = atom(
  (get) => (sessionId: string) => {
    return get(startedSessionsAtom).has(sessionId);
  }
);

// Reset all state atom
export const resetVoiceChatStateAtom = atom(
  null,
  (get, set) => {
    set(sessionIdAtom, null);
    set(isSessionActiveAtom, false);
    set(isConnectingAtom, false);
    set(errorAtom, null);
    set(transcriptAtom, '');
    set(aiResponseAtom, '');
    set(currentSessionIdAtom, '');
    set(isStartingSessionAtom, false);
    set(voiceChatModeAtom, 'report');
    set(formDataAtom, {});
    set(completedFieldsAtom, new Set());
    set(formProgressAtom, {});
    set(templateCreationProgressAtom, {});
    set(isCreatingTemplateAtom, false);
    set(createdTemplateAtom, null);
    set(callbacksAtom, {});
    set(templateInstructionsAtom, '');
    set(activeTemplateAtom, null);
    set(selectedTemplateAtom, null);
  }
);

// Actions atoms for managing WebRTC resources
export const cleanupWebRTCAtom = atom(
  null,
  async (get, set) => {
    console.log('🧹 Cleaning up WebRTC resources...');
    
    // Stop local stream
    const localStream = get(localStreamAtom);
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log(`🎤 Stopping ${track.kind} track`);
        track.stop();
      });
      set(localStreamAtom, null);
    }
    
    // Clean up all data channels
    const allChannels = get(allDataChannelsAtom);
    allChannels.forEach((channel, index) => {
      console.log(`🧹 Cleaning channel ${index}: state=${channel.readyState}`);
      channel.onmessage = null;
      channel.onerror = null;
      channel.onopen = null;
      channel.onclose = null;
      if (channel.readyState === 'open') {
        try {
          channel.close();
        } catch (error) {
          console.log(`⚠️ Error closing channel ${index}:`, error);
        }
      }
    });
    set(allDataChannelsAtom, []);
    set(dataChannelAtom, null);
    
    // Close peer connection
    const peerConnection = get(peerConnectionAtom);
    if (peerConnection) {
      console.log('🔗 Closing peer connection...');
      
      // Remove event handlers
      peerConnection.onconnectionstatechange = null;
      peerConnection.oniceconnectionstatechange = null;
      peerConnection.ondatachannel = null;
      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;
      
      // Close connection
      if (peerConnection.connectionState !== 'closed') {
        peerConnection.close();
      }
      
      set(peerConnectionAtom, null);
    }
    
    console.log('✅ WebRTC cleanup completed');
  }
); 