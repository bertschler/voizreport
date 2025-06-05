'use client';

import React, { useEffect } from 'react';
import { useVoiceChat, FormSummary } from '../hooks/useVoiceChat';
import { ReportTemplate } from '../data/mockData';
import StatusIndicator from './voice-chat/StatusIndicator';
import StatusText from './voice-chat/StatusText';
import VoiceActionButton from './voice-chat/VoiceActionButton';
import ErrorDisplay from './voice-chat/ErrorDisplay';
import FormFieldsDisplay from './FormFieldsDisplay';
import VoiceModeToggle from './voice-chat/VoiceModeToggle';

interface LiveVoiceChatProps {
  onSessionReady?: (sessionId: string) => void;
  template: ReportTemplate;
  onFormCompleted?: (summary: FormSummary) => void;
}

// Export the FormSummary type for external use
export type { FormSummary };

const LiveVoiceChat = React.memo(function LiveVoiceChat({ onSessionReady, template, onFormCompleted }: LiveVoiceChatProps) {
  const componentInstanceId = React.useRef(Math.random().toString(36).substr(2, 9));
  console.log('🏗️ LiveVoiceChat component created/re-rendered. Instance ID:', componentInstanceId.current);

  const templateInstructions = template.title + "\n\n" + template.definition + "\n\nForm fields:\n" + JSON.stringify(template.openai_properties);

  const {
    isSessionActive,
    isConnecting,
    error,
    formProgress,
    startSession,
    endSession
  } = useVoiceChat({
    template,
    templateInstructions,
    onSessionReady,
    onFormCompleted
  });

  // Cleanup effect only
  useEffect(() => {
    return () => {
      console.log('🗑️ LiveVoiceChat cleanup. Instance:', componentInstanceId.current);
    };
  }, []);

  // Parse form fields from openai_properties for instructions
  const getFormFields = () => {
    try {
      const properties = template.openai_properties || {};
      const requiredFields = template.required_fields || [];
      return Object.entries(properties).map(([key, property]: [string, any]) => ({
        key,
        required: requiredFields.includes(key),
        'voice:prompt': property.description || key
      }));
    } catch {
      return [];
    }
  };

  const formFields = getFormFields();

  return (
    <div style={{
      padding: '32px 24px',
      textAlign: 'center',
      maxWidth: '400px',
      margin: '0 auto',
      position: 'relative'
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

      {/* Action Button - Centered with integrated recording animation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80px'
      }}>
        <VoiceActionButton
          isSessionActive={isSessionActive}
          isConnecting={isConnecting}
          onStart={startSession}
          onStop={endSession}
        />
      </div>
      {/* Voice Mode Toggle - Top Right Corner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '32px',
      }}>
        <VoiceModeToggle />
      </div>

      {/* Template Instructions */}
      <div style={{
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f1f5f9',
        borderRadius: '12px',
        textAlign: 'left'
      }}>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#334155'
        }}>
          {template.icon} Instructions
        </h3>
        <p style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          color: '#64748b',
          lineHeight: '1.5'
        }}>
          {template.definition}
        </p>

        <FormFieldsDisplay
          formFields={formFields}
          formProgress={formProgress}
        />
      </div>
    </div>
  );
});

export default LiveVoiceChat; 