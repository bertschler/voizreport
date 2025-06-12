'use client';

// Usage examples:
// 
// For report filling mode (existing functionality):
// <VoiceChatComponent template={someTemplate} mode="report" />
// 
// For template creation mode (new functionality):
// <VoiceChatComponent mode="template" />

import React, { useEffect } from 'react';
import { useVoiceChat, FormSummary, VoiceChatMode, TemplateCreationProgress, CreatedTemplate } from '../hooks/useVoiceChat';
import ErrorDisplay from './ErrorDisplay';
import FormFieldsDisplay from '../components/FormFieldsDisplay';
import VoiceModeToggle from './VoiceModeToggle';
import CameraButton from './CameraButton';
import LivePhotoViewer from './LivePhotoViewer';
import TemplateCreationProgressComponent from './TemplateCreationProgress';
import CreatedTemplateResult from './CreatedTemplateResult';
import TemplateCreationInstructions from './TemplateCreationInstructions';
import { TurnIndicator } from '../components/TurnIndicator';
import { ReportTemplate } from "@/app/types/core";

interface Props {
  template?: ReportTemplate;
  mode?: VoiceChatMode;
}

// Export the types for external use
export type { FormSummary, VoiceChatMode, TemplateCreationProgress, CreatedTemplate };

const VoiceChatComponent = React.memo(function VoiceChatComponent({ template, mode = 'report' }: Props) {
  // Helper function to add timestamps to logs
  const ts = () => new Date().toISOString().substring(11, 23) + " VoiceChatComponent";
  
  const componentInstanceId = React.useRef(Math.random().toString(36).substr(2, 9));
  console.log(`${ts()} 🏗️ created/re-rendered. Instance ID:`, componentInstanceId.current);

  const {
    error,
    formProgress,
    voiceChatMode,
    templateCreationProgress,
    createdTemplate,
    startTemplateCreation,
    nextFieldToUpdate,
  } = useVoiceChat();

  // Cleanup effect only
  useEffect(() => {
    return () => {
      console.log(`${ts()} 🗑️ cleanup. Instance:`, componentInstanceId.current);
    };
  }, []);

  // Auto-start template creation if mode is template
  useEffect(() => {
    if (mode === 'template' && voiceChatMode !== 'template') {
      console.log(`${ts()} 🎯 Auto-starting template creation mode`);
      startTemplateCreation();
    }
  }, [mode, voiceChatMode, startTemplateCreation]);

  // Parse form fields from openai_properties for instructions (report mode only)
  const getFormFields = () => {
    if (!template || voiceChatMode === 'template') return [];
    
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
  const isReportMode = voiceChatMode === 'report';
  const isTemplateMode = voiceChatMode === 'template';

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

      <TurnIndicator/>

      {/* Controls - Voice Mode Toggle and Camera Button (only for report mode) */}
      {isReportMode && (
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
            nextFieldToUpdate={nextFieldToUpdate}
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

export default VoiceChatComponent;