import React from 'react';

interface FormField {
  key: string;
  required?: boolean;
  'voice:prompt'?: string;
  enum?: string[];
}

interface FormFieldsDisplayProps {
  formFields: FormField[];
  formProgress: Record<string, any>;
  nextFieldToUpdate?: string;
}

const FormFieldsDisplay: React.FC<FormFieldsDisplayProps> = ({ 
  formFields, 
  formProgress,
  nextFieldToUpdate
}) => {
  if (formFields.length === 0) {
    return null;
  }

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
          📋 Form Information
        </h4>
        
        {Object.keys(formProgress).length > 0 && (
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            {Object.keys(formProgress).length} / {formFields.length} completed
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {Object.keys(formProgress).length > 0 && (
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
        {formFields.map((field: FormField, index: number) => {
          const fieldValue = formProgress[field.key];
          const isCompleted = formProgress.hasOwnProperty(field.key) && fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
          
          return (
            <div key={index} style={{
              padding: '8px 12px',
              backgroundColor: isCompleted ? '#ffffff' : '#fafafa',
              borderRadius: '8px',
              border: isCompleted ? '1px solid #22c55e' : '1px solid #e2e8f0',
              fontSize: '13px',
              position: 'relative'
            }}>
              {field.key === nextFieldToUpdate && !isCompleted && (
                <div style={{
                  position: 'absolute',
                  left: '-32px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px',
                  zIndex: 10,
                  color: '#8b5cf6'
                }}>
                  👉
                </div>
              )}
              <div style={{
                fontWeight: '600',
                color: isCompleted ? '#475569' : '#64748b',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ color: isCompleted ? '#22c55e' : '#94a3b8' }}>
                  {isCompleted ? '✓' : '○'}
                </span>
                {field.key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                {field.required && !isCompleted && <span style={{ color: '#ef4444' }}> *</span>}
              </div>
              
              {isCompleted ? (
                <div style={{
                  color: '#64748b',
                  wordBreak: 'break-word'
                }}>
                  {Array.isArray(fieldValue) ? fieldValue.join(', ') : String(fieldValue)}
                </div>
              ) : (
                <>
                  <div style={{
                    color: '#94a3b8',
                    fontSize: '12px',
                    fontStyle: 'italic'
                  }}>
                    {field['voice:prompt']}
                  </div>
                  {field.enum && field.enum.length > 0 && (
                    <div style={{
                      marginTop: '4px',
                      paddingLeft: '8px',
                      borderLeft: '2px solid #e2e8f0',
                      color: '#94a3b8',
                      fontSize: '11px',
                    }}>
                      <strong>Options:</strong> {field.enum.join(', ')}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {formFields.some((field: FormField) => field.required && !formProgress.hasOwnProperty(field.key)) && (
        <p style={{
          margin: '8px 0 0 0',
          fontSize: '12px',
          color: '#94a3b8',
          fontStyle: 'italic'
        }}>
          * Required fields
        </p>
      )}
    </div>
  );
};

export default FormFieldsDisplay; 