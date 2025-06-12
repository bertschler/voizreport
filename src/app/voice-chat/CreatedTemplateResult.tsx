import React from 'react';
import { CreatedTemplate } from '../hooks/useVoiceChat';

interface CreatedTemplateResultProps {
  createdTemplate: CreatedTemplate;
}

const CreatedTemplateResult: React.FC<CreatedTemplateResultProps> = ({ 
  createdTemplate 
}) => {
  const handleSaveTemplate = () => {
    // TODO: Save template to database/state
    console.log('Template to save:', createdTemplate);
    alert('Template saved! (This would save to your templates in a real implementation)');
  };

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
        onClick={handleSaveTemplate}
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

export default CreatedTemplateResult; 