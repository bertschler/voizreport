import React from 'react';
import { TemplateCreationProgress as TemplateCreationProgressType } from '../hooks/useVoiceChat';

interface TemplateCreationProgressProps {
  templateCreationProgress: TemplateCreationProgressType;
}

const TemplateCreationProgress: React.FC<TemplateCreationProgressProps> = ({ 
  templateCreationProgress 
}) => {
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

export default TemplateCreationProgress; 