'use client';

// Usage examples:
// 
// For report filling mode (existing functionality):
// <LiveVoiceChat template={someTemplate} mode="report" />
// 
// For template creation mode (new functionality):
// <LiveVoiceChat mode="template-creation" />

import React, { useEffect } from 'react';
import { useVoiceChat, FormSummary, VoiceChatMode, TemplateCreationProgress, CreatedTemplate } from '../hooks/useVoiceChat';
import { ReportTemplate } from '../data/mockData';
import SmartMicButton from './SmartMicButton';
import ErrorDisplay from './voice-chat/ErrorDisplay';
import FormFieldsDisplay from './FormFieldsDisplay';
import TemplateFieldsDisplay from './TemplateFieldsDisplay';
import VoiceModeToggle from './voice-chat/VoiceModeToggle';
import CameraButton from './voice-chat/CameraButton';
import LivePhotoViewer from './voice-chat/LivePhotoViewer';
import TemplateCreationProgressComponent from './voice-chat/TemplateCreationProgress';
import CreatedTemplateResult from './voice-chat/CreatedTemplateResult';
import TemplateCreationInstructions from './voice-chat/TemplateCreationInstructions';

interface LiveVoiceChatProps {
  template?: ReportTemplate;
  mode?: VoiceChatMode;
}

// Export the types for external use
export type { FormSummary, VoiceChatMode, TemplateCreationProgress, CreatedTemplate };

const LiveVoiceChat = React.memo(function LiveVoiceChat({ template, mode = 'report' }: LiveVoiceChatProps) {
  const componentInstanceId = React.useRef(Math.random().toString(36).substr(2, 9));
  console.log('🏗️ LiveVoiceChat component created/re-rendered. Instance ID:', componentInstanceId.current);

  const {
    error,
    formProgress,
    voiceChatMode,
    templateCreationProgress,
    isCreatingTemplate,
    createdTemplate,
    endSession,
    startTemplateCreation
  } = useVoiceChat();

  // Cleanup effect only
  useEffect(() => {
    return () => {
      console.log('🗑️ LiveVoiceChat cleanup. Instance:', componentInstanceId.current);
    };
  }, []);

  // Auto-start template creation if mode is template-creation
  useEffect(() => {
    console.log('🔍 LiveVoiceChat effect triggered:');
    console.log('🔍   mode:', mode);
    console.log('🔍   voiceChatMode:', voiceChatMode);
    console.log('🔍   isCreatingTemplate:', isCreatingTemplate);
    
    if (mode === 'template-creation' && voiceChatMode !== 'template-creation') {
      console.log('🎯 Auto-starting template creation mode');
      startTemplateCreation();
    } else {
      console.log('🔍 Conditions not met for template creation start');
    }
  }, [mode, voiceChatMode, startTemplateCreation]);

  // Parse form fields from openai_properties for instructions (report mode only)
  const getFormFields = () => {
    if (!template || voiceChatMode === 'template-creation') return [];
    
    try {
      const properties = template.openai_properties || {};
      const requiredFields = template.required_fields || [];
      return Object.entries(properties).map(([key, property]: [string, any]) => ({
        key,
        required: requiredFields.includes(key),
        'voice:prompt': property.description || key,
        enum: property.enum
      }));
    } catch {
      return [];
    }
  };

  const formFields = getFormFields();
  const isTemplateMode = voiceChatMode === 'template-creation';

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

      {/* Controls - Voice Mode Toggle and Camera Button (only for report mode) */}
      {!isTemplateMode && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          <VoiceModeToggle />
          <CameraButton />
        </div>
      )}

      {/* Template Creation Progress */}
      {isTemplateMode && (
        <TemplateCreationProgressComponent
          templateCreationProgress={templateCreationProgress}
        />
      )}

      {/* Created Template Result */}
      {createdTemplate && (
        <CreatedTemplateResult
          createdTemplate={createdTemplate}
        />
      )}

      {/* Live Photo Viewer (for report mode only) */}
        <LivePhotoViewer />

      {/* Template Instructions (for report mode only) */}
      {!isTemplateMode && template && (
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
      )}

      {/* Template Creation Instructions */}
      {isTemplateMode && !createdTemplate && (
        <TemplateCreationInstructions
          templateProgress={templateCreationProgress}
        />
      )}
    </div>
  );
});

export default LiveVoiceChat; 