'use client';

import React from 'react';
import { useVoiceChat, FormSummary } from '../hooks/useVoiceChat';
import StatusIndicator from './voice-chat/StatusIndicator';
import StatusText from './voice-chat/StatusText';
import RecordingAnimation from './voice-chat/RecordingAnimation';
import VoiceActionButton from './voice-chat/VoiceActionButton';
import ErrorDisplay from './voice-chat/ErrorDisplay';

interface LiveVoiceChatProps {
  onSessionReady?: (sessionId: string) => void;
  templateInstructions?: string;
  onFormCompleted?: (summary: FormSummary) => void;
}

// Export the FormSummary type for external use
export type { FormSummary };

export default function LiveVoiceChat({ onSessionReady, templateInstructions, onFormCompleted }: LiveVoiceChatProps) {
  const {
    isSessionActive,
    isConnecting,
    error,
    startSession,
    endSession,
    remoteAudioRef
  } = useVoiceChat({
    templateInstructions,
    onSessionReady,
    onFormCompleted
  });

  return (
    <div style={{
      padding: '32px 24px',
      textAlign: 'center',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      {/* Error Display */}
      <ErrorDisplay error={error} />

      {/* Visual Status Indicator */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <StatusIndicator 
          isConnecting={isConnecting} 
          isSessionActive={isSessionActive} 
        />
        
        <StatusText 
          isConnecting={isConnecting} 
          isSessionActive={isSessionActive} 
        />
        
      </div>

      {/* Action Button */}
      <div style={{ marginBottom: '24px' }}>
        <VoiceActionButton
          isSessionActive={isSessionActive}
          isConnecting={isConnecting}
          onStart={startSession}
          onStop={endSession}
        />
      </div>

      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <RecordingAnimation isVisible={isSessionActive} />
      </div>

      {/* Hidden Audio Element */}
      <audio 
        ref={remoteAudioRef} 
        autoPlay 
        playsInline
        style={{ display: 'none' }}
      />
    </div>
  );
} 