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
import VoiceModeToggle from './voice-chat/VoiceModeToggle';

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
        'voice:prompt': property.description || key
      }));
    } catch {
      return [];
    }
  };

  const formFields = getFormFields();
  const isTemplateMode = voiceChatMode === 'template-creation';

  // Render template creation progress display
  const renderTemplateCreationProgress = () => {
    if (!isTemplateMode) return null;

    return (
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
          🎨 Template Creation Progress
        </h3>
        
        {templateCreationProgress.title && (
          <div style={{ marginBottom: '8px' }}>
            <strong>Title:</strong> {templateCreationProgress.title}
          </div>
        )}
        
        {templateCreationProgress.description && (
          <div style={{ marginBottom: '8px' }}>
            <strong>Description:</strong> {templateCreationProgress.description}
          </div>
        )}
        
        {templateCreationProgress.icon && (
          <div style={{ marginBottom: '8px' }}>
            <strong>Icon:</strong> {templateCreationProgress.icon}
          </div>
        )}
        
        {templateCreationProgress.fields && templateCreationProgress.fields.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <strong>Fields ({templateCreationProgress.fields.length}):</strong>
            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
              {templateCreationProgress.fields.map((field, index) => (
                <li key={index} style={{ marginBottom: '2px', fontSize: '14px' }}>
                  <strong>{field.name}</strong> ({field.type})
                  {field.required && <span style={{ color: '#e11d48' }}>*</span>}
                  {field.enum && ` - Options: ${field.enum.join(', ')}`}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {templateCreationProgress.currentPhase && (
          <div style={{ 
            padding: '8px 12px',
            backgroundColor: '#e0f2fe',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#0369a1'
          }}>
            Current Phase: {templateCreationProgress.currentPhase.replace('-', ' ').toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  // Render created template result
  const renderCreatedTemplate = () => {
    if (!createdTemplate) return null;

    return (
      <div style={{
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f0fdf4',
        borderRadius: '12px',
        textAlign: 'left',
        border: '2px solid #22c55e'
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#166534'
        }}>
          ✅ Template Created Successfully!
        </h3>
        
        <div style={{ marginBottom: '8px' }}>
          <strong>{createdTemplate.icon} {createdTemplate.title}</strong>
        </div>
        
        <div style={{ marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
          {createdTemplate.description}
        </div>
        
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          <strong>Fields:</strong> {Object.keys(createdTemplate.openai_properties || {}).length}
        </div>
        
        <button
          onClick={() => {
            // TODO: Save template to database/state
            console.log('Template to save:', createdTemplate);
            alert('Template saved! (This would save to your templates in a real implementation)');
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Save Template
        </button>
      </div>
    );
  };

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

      {/* Voice Mode Toggle - Top Right Corner (only for report mode) */}
      {!isTemplateMode && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
        }}>
          <VoiceModeToggle />
        </div>
      )}

      {/* Template Creation Progress */}
      {renderTemplateCreationProgress()}

      {/* Created Template Result */}
      {renderCreatedTemplate()}

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
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#fef3c7',
          borderRadius: '12px',
          textAlign: 'left'
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#92400e'
          }}>
            🎨 Create New Template
          </h3>
          <p style={{
            margin: '0',
            fontSize: '14px',
            color: '#a16207',
            lineHeight: '1.5'
          }}>
            I'll help you create a new report template by asking you questions about what kind of data you want to collect. 
            Let's design this step by step!
          </p>
        </div>
      )}
    </div>
  );
});

export default LiveVoiceChat; 