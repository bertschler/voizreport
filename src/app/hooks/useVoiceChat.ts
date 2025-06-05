import { useAtom } from 'jotai';
import {
  sessionIdAtom,
  isSessionActiveAtom,
  isConnectingAtom,
  errorAtom,
  transcriptAtom,
  aiResponseAtom,
  hasPermissionAtom,
  formProgressAtom,
  selectedTemplateAtom,
  FormSummary
} from '@/app/state/voiceChatState';

// Re-export FormSummary for external use
export type { FormSummary };

export interface VoiceChatState {
  sessionId: string | null;
  isSessionActive: boolean;
  hasPermission: boolean;
  isConnecting: boolean;
  transcript: string;
  aiResponse: string;
  error: string | null;
  formProgress: Record<string, any>;
}

export interface VoiceChatActions {
  endSession: () => void;
}

export function useVoiceChat(): VoiceChatState & VoiceChatActions {
  // Jotai atoms - just read state, provider handles updates
  const [sessionId] = useAtom(sessionIdAtom);
  const [isSessionActive] = useAtom(isSessionActiveAtom);
  const [isConnecting] = useAtom(isConnectingAtom);
  const [error] = useAtom(errorAtom);
  const [transcript] = useAtom(transcriptAtom);
  const [aiResponse] = useAtom(aiResponseAtom);
  const [hasPermission] = useAtom(hasPermissionAtom);
  const [formProgress] = useAtom(formProgressAtom);
  const [, setSelectedTemplate] = useAtom(selectedTemplateAtom);

  // End session by clearing selected template (provider will handle cleanup)
  const endSession = () => {
    console.log('🔒 Ending session via useVoiceChat hook');
    setSelectedTemplate(null);
  };

  return {
    // State
    sessionId,
    isSessionActive,
    hasPermission,
    isConnecting,
    transcript,
    aiResponse,
    error,
    formProgress,
    
    // Actions
    endSession
  };
} 