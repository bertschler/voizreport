'use client';

import React, { useEffect } from 'react';
import { useVoiceChatWithJotai, FormSummary } from '../hooks/useVoiceChatWithJotai';
import { ReportTemplate } from '../data/mockData';
import StatusIndicator from './voice-chat/StatusIndicator';
import StatusText from './voice-chat/StatusText';
import RecordingAnimation from './voice-chat/RecordingAnimation';
import VoiceActionButton from './voice-chat/VoiceActionButton';
import ErrorDisplay from './voice-chat/ErrorDisplay';

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
  console.log('🏗️ Template:', template.title);
  
  const templateInstructions = template.title + "\n\n" + template.definition + "\n\n" + template.form;
  
  const {
    isSessionActive,
    isConnecting,
    error,
    startSession,
    endSession
  } = useVoiceChatWithJotai({
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

  // Parse form fields from template for instructions
  const getFormFields = () => {
    try {
      const formData = JSON.parse(template.form || '{}');
      return formData.fields || [];
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
      margin: '0 auto'
    }}>
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
        
        {formFields.length > 0 && (
          <div>
            <h4 style={{
              margin: '12px 0 8px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#475569'
            }}>
              Information to provide:
            </h4>
            <ul style={{
              margin: '0',
              paddingLeft: '16px',
              fontSize: '13px',
              color: '#64748b',
              lineHeight: '1.4'
            }}>
              {formFields.map((field: any, index: number) => (
                <li key={index} style={{ marginBottom: '4px' }}>
                  <strong>{field.key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}:</strong>
                  {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                  {field['voice:prompt'] && (
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      {field['voice:prompt']}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '12px',
              color: '#94a3b8',
              fontStyle: 'italic'
            }}>
              * Required fields
            </p>
          </div>
        )}
      </div>

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
    </div>
  );
});

export default LiveVoiceChat; 