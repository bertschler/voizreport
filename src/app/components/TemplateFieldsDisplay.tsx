import React from 'react';
import { TemplateCreationProgress } from '../hooks/useVoiceChat';

interface TemplateFieldsDisplayProps {
  templateProgress: TemplateCreationProgress;
}

const TemplateFieldsDisplay: React.FC<TemplateFieldsDisplayProps> = ({ 
  templateProgress 
}) => {
  const fieldsCount = templateProgress.fields?.length || 0;
  const hasTitle = !!templateProgress.title;
  const hasAIMetadata = !!(templateProgress.description || templateProgress.definition || templateProgress.icon);
  
  // Calculate progress based on what really matters to the user
  const essentialProgress = (hasTitle ? 1 : 0) + (fieldsCount > 0 ? 1 : 0);
  const maxEssentialProgress = 2; // Title + Fields
  
  return (
    <div>
      {/* Main Progress Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h4 style={{
          margin: '0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151'
        }}>
          🎨 Template Creation
        </h4>
        
        <div style={{
          fontSize: '13px',
          color: '#6b7280',
          fontWeight: '500'
        }}>
          {essentialProgress} / {maxEssentialProgress} core items
        </div>
      </div>

      {/* Progress Bar - Based on essential items only */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(essentialProgress / maxEssentialProgress) * 100}%`,
          height: '100%',
          backgroundColor: '#8b5cf6',
          borderRadius: '4px',
          transition: 'width 0.3s ease-in-out'
        }} />
      </div>

      {/* Primary Section - User Controlled */}
      <div style={{ marginBottom: '20px' }}>
        {/* Template Title - Most important */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: hasTitle ? '#ffffff' : '#fefefe',
          borderRadius: '12px',
          border: hasTitle ? '2px solid #8b5cf6' : '2px dashed #d1d5db',
          marginBottom: '12px'
        }}>
          <div style={{
            fontWeight: '600',
            color: hasTitle ? '#374151' : '#6b7280',
            fontSize: '14px',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ 
              fontSize: '16px',
              color: hasTitle ? '#8b5cf6' : '#9ca3af' 
            }}>
              {hasTitle ? '✓' : '○'}
            </span>
            Template Name
            {!hasTitle && <span style={{ color: '#ef4444', fontSize: '12px' }}>Required</span>}
          </div>
          
          {hasTitle ? (
            <div style={{
              color: '#374151',
              fontSize: '15px',
              fontWeight: '500',
              marginLeft: '24px'
            }}>
              {templateProgress.title}
            </div>
          ) : (
            <div style={{
              color: '#9ca3af',
              fontSize: '13px',
              fontStyle: 'italic',
              marginLeft: '24px'
            }}>
              Give your template a clear, descriptive name
            </div>
          )}
        </div>

        {/* Template Fields - Second most important */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: fieldsCount > 0 ? '#ffffff' : '#fefefe',
          borderRadius: '12px',
          border: fieldsCount > 0 ? '2px solid #8b5cf6' : '2px dashed #d1d5db'
        }}>
          <div style={{
            fontWeight: '600',
            color: fieldsCount > 0 ? '#374151' : '#6b7280',
            fontSize: '14px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ 
              fontSize: '16px',
              color: fieldsCount > 0 ? '#8b5cf6' : '#9ca3af' 
            }}>
              {fieldsCount > 0 ? '✓' : '○'}
            </span>
            Data Fields ({fieldsCount})
            {fieldsCount === 0 && <span style={{ color: '#ef4444', fontSize: '12px' }}>Required</span>}
          </div>
          
          {fieldsCount > 0 ? (
            <div style={{ marginLeft: '24px' }}>
              {templateProgress.fields!.map((field, idx) => (
                <div key={idx} style={{ 
                  marginBottom: '6px', 
                  fontSize: '13px',
                  color: '#4b5563'
                }}>
                  <span style={{ fontWeight: '500' }}>{field.name}</span>
                  <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                    ({field.type})
                  </span>
                  {field.required && (
                    <span style={{ color: '#8b5cf6', fontSize: '11px', marginLeft: '4px' }}>
                      required
                    </span>
                  )}
                  {field.enum && field.enum.length > 0 && (
                    <div style={{ 
                      color: '#9ca3af', 
                      fontSize: '11px',
                      marginLeft: '16px',
                      marginTop: '2px'
                    }}>
                      Options: {field.enum.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              color: '#9ca3af',
              fontSize: '13px',
              fontStyle: 'italic',
              marginLeft: '24px'
            }}>
              Define what data this template should collect
            </div>
          )}
        </div>
      </div>

      {/* Secondary Section - AI Generated Metadata */}
      {hasAIMetadata && (
        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px',
          marginTop: '16px'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#9ca3af',
            fontWeight: '500',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            AI-Generated Details
          </div>
          
          <div style={{
            display: 'grid',
            gap: '8px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
          }}>
            {templateProgress.icon && (
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  fontWeight: '500',
                  marginBottom: '4px'
                }}>
                  ICON
                </div>
                <div style={{ fontSize: '18px' }}>
                  {templateProgress.icon}
                </div>
              </div>
            )}
            
            {templateProgress.description && (
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                gridColumn: templateProgress.icon ? 'auto' : '1 / -1'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  fontWeight: '500',
                  marginBottom: '4px'
                }}>
                  DESCRIPTION
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#4b5563',
                  lineHeight: '1.4'
                }}>
                  {templateProgress.description}
                </div>
              </div>
            )}
            
            {templateProgress.definition && (
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                gridColumn: '1 / -1'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  fontWeight: '500',
                  marginBottom: '4px'
                }}>
                  DETAILED DEFINITION
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#4b5563',
                  lineHeight: '1.4'
                }}>
                  {templateProgress.definition}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current Phase Indicator */}
      {templateProgress.currentPhase && (
        <div style={{
          marginTop: '16px',
          padding: '6px 12px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#6b7280',
          textAlign: 'center',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {templateProgress.currentPhase.replace('-', ' ')}
        </div>
      )}
    </div>
  );
};

export default TemplateFieldsDisplay; 