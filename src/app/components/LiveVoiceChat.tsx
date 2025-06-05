'use client';

import React, { useEffect } from 'react';
import { useVoiceChat, FormSummary } from '../hooks/useVoiceChat';
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
  
  const templateInstructions = template.title + "\n\n" + template.definition;
  
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
      return Object.entries(properties).map(([key, property]: [string, any]) => ({
        key,
        required: true, // Assuming all fields are required by default
        'voice:prompt': property.description || `Please provide ${key.replace(/_/g, ' ')}`
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

      {/* Form Progress Display */}
      {isSessionActive && Object.keys(formProgress).length > 0 && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '2px solid #e2e8f0',
          textAlign: 'left'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h3 style={{
              margin: '0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 Information Captured
            </h3>
            
            {formFields.length > 0 && (
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '500'
              }}>
                {Object.keys(formProgress).length} / {formFields.length} fields
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {formFields.length > 0 && (
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#e2e8f0',
              borderRadius: '3px',
              marginBottom: '12px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(Object.keys(formProgress).length / formFields.length) * 100}%`,
                height: '100%',
                backgroundColor: '#22c55e',
                borderRadius: '3px',
                transition: 'width 0.3s ease-in-out'
              }} />
            </div>
          )}
          
          <div style={{
            display: 'grid',
            gap: '8px'
          }}>
            {Object.entries(formProgress).map(([key, value]) => (
              <div key={key} style={{
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px'
              }}>
                <div style={{
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ color: '#22c55e' }}>✓</span>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </div>
                <div style={{
                  color: '#64748b',
                  wordBreak: 'break-word'
                }}>
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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