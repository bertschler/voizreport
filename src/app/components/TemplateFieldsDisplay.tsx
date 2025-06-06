import React from 'react';
import { TemplateCreationProgress } from '../hooks/useVoiceChat';

interface TemplateFieldsDisplayProps {
  templateProgress: TemplateCreationProgress;
}

const TemplateFieldsDisplay: React.FC<TemplateFieldsDisplayProps> = ({ 
  templateProgress 
}) => {
  // Define the core template fields that need to be completed
  const coreFields = [
    { key: 'title', label: 'Template Title', required: true },
    { key: 'description', label: 'Description', required: true },
    { key: 'definition', label: 'Definition', required: true },
    { key: 'icon', label: 'Icon', required: true }
  ];

  const completedCoreFields = coreFields.filter(field => 
    templateProgress[field.key as keyof TemplateCreationProgress]
  );

  const fieldsCount = templateProgress.fields?.length || 0;
  const totalProgress = completedCoreFields.length + (fieldsCount > 0 ? 1 : 0); // +1 for having any fields
  const maxProgress = coreFields.length + 1; // Core fields + fields definition

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <h4 style={{
          margin: '0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#475569'
        }}>
          🎨 Template Creation Progress
        </h4>
        
        <div style={{
          fontSize: '12px',
          color: '#64748b',
          fontWeight: '500'
        }}>
          {totalProgress} / {maxProgress} completed
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '6px',
        backgroundColor: '#e2e8f0',
        borderRadius: '3px',
        marginBottom: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(totalProgress / maxProgress) * 100}%`,
          height: '100%',
          backgroundColor: '#8b5cf6',
          borderRadius: '3px',
          transition: 'width 0.3s ease-in-out'
        }} />
      </div>
      
      <div style={{
        display: 'grid',
        gap: '8px'
      }}>
        {/* Core template fields */}
        {coreFields.map((field, index) => {
          const isCompleted = !!templateProgress[field.key as keyof TemplateCreationProgress];
          const fieldValue = templateProgress[field.key as keyof TemplateCreationProgress];
          
          return (
            <div key={index} style={{
              padding: '8px 12px',
              backgroundColor: isCompleted ? '#ffffff' : '#fafafa',
              borderRadius: '8px',
              border: isCompleted ? '1px solid #8b5cf6' : '1px solid #e2e8f0',
              fontSize: '13px'
            }}>
              <div style={{
                fontWeight: '600',
                color: isCompleted ? '#475569' : '#64748b',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ color: isCompleted ? '#8b5cf6' : '#94a3b8' }}>
                  {isCompleted ? '✓' : '○'}
                </span>
                {field.label}
                {field.required && !isCompleted && <span style={{ color: '#ef4444' }}> *</span>}
              </div>
              
              {isCompleted ? (
                <div style={{
                  color: '#64748b',
                  wordBreak: 'break-word'
                }}>
                  {String(fieldValue)}
                </div>
              ) : (
                <div style={{
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontStyle: 'italic'
                }}>
                  {field.key === 'title' && 'A clear name for this template'}
                  {field.key === 'description' && 'Brief explanation of what this template is for'}
                  {field.key === 'definition' && 'Detailed instructions about what data to collect'}
                  {field.key === 'icon' && 'An emoji to represent this template'}
                </div>
              )}
            </div>
          );
        })}

        {/* Fields definition */}
        <div style={{
          padding: '8px 12px',
          backgroundColor: fieldsCount > 0 ? '#ffffff' : '#fafafa',
          borderRadius: '8px',
          border: fieldsCount > 0 ? '1px solid #8b5cf6' : '1px solid #e2e8f0',
          fontSize: '13px'
        }}>
          <div style={{
            fontWeight: '600',
            color: fieldsCount > 0 ? '#475569' : '#64748b',
            marginBottom: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ color: fieldsCount > 0 ? '#8b5cf6' : '#94a3b8' }}>
              {fieldsCount > 0 ? '✓' : '○'}
            </span>
            Template Fields ({fieldsCount})
            {fieldsCount === 0 && <span style={{ color: '#ef4444' }}> *</span>}
          </div>
          
          {fieldsCount > 0 ? (
            <div style={{
              color: '#64748b'
            }}>
              {templateProgress.fields!.map((field, idx) => (
                <div key={idx} style={{ marginBottom: '4px', fontSize: '12px' }}>
                  <strong>{field.name}</strong> ({field.type})
                  {field.required && <span style={{ color: '#8b5cf6' }}> *required</span>}
                  {field.enum && field.enum.length > 0 && (
                    <span style={{ color: '#94a3b8' }}> - Options: {field.enum.join(', ')}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              color: '#94a3b8',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              Define the data fields this template should collect
            </div>
          )}
        </div>
      </div>

      {/* Current Phase Indicator */}
      {templateProgress.currentPhase && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          Current Phase: {templateProgress.currentPhase.replace('-', ' ').toUpperCase()}
        </div>
      )}
      
      <p style={{
        margin: '8px 0 0 0',
        fontSize: '12px',
        color: '#94a3b8',
        fontStyle: 'italic'
      }}>
        * Required for template completion
      </p>
    </div>
  );
};

export default TemplateFieldsDisplay; 