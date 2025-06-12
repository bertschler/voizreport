import React from 'react';
import { TemplateCreationProgress } from '../hooks/useVoiceChat';
import TemplateFieldsDisplay from '../components/TemplateFieldsDisplay';

interface TemplateCreationInstructionsProps {
  templateProgress: TemplateCreationProgress;
}

const TemplateCreationInstructions: React.FC<TemplateCreationInstructionsProps> = ({ 
  templateProgress 
}) => {
  return (
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
        margin: '0 0 12px 0',
        fontSize: '14px',
        color: '#a16207',
        lineHeight: '1.5'
      }}>
        I'll help you create a new report template by asking you questions about what kind of data you want to collect. 
        Let's design this step by step!
      </p>

      <TemplateFieldsDisplay
        templateProgress={templateProgress}
      />
    </div>
  );
};

export default TemplateCreationInstructions; 