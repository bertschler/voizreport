'use client';

import React, { useState } from 'react';
import AiButton from './AiButton';
import { StoredTemplate } from '../state/templatesState';
import { ReportTemplate } from "@/app/types/core";

interface TemplatesListProps {
  templates: StoredTemplate[];
  onStartReport: (template: ReportTemplate) => void;
  onCreateTemplate?: () => void;
  onEditTemplate?: (template: ReportTemplate) => void;
}

export default function TemplatesList({ 
  templates, 
  onStartReport, 
  onCreateTemplate,
  onEditTemplate
}: TemplatesListProps) {
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  return (
    <>
      {/* Create Template Button */}
      <div style={{ marginBottom: '24px' }}>
        <AiButton
          onClick={onCreateTemplate}
          size="sm"
          variant="primary"
          style={{ width: '100%' }}
        >
          <span style={{ color: '#ffffff' }}>✨</span> Create New Template
        </AiButton>
      </div>

      {/* Templates List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {templates.map((template) => (
          <div 
            key={template.id} 
            onMouseEnter={() => setHoveredCardId(template.id)}
            onMouseLeave={() => setHoveredCardId(null)}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
              position: 'relative'
            }}
          >
            {onEditTemplate && hoveredCardId === template.id && (
              <button
                onClick={() => onEditTemplate(template)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.color = '#475569';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.color = '#64748b';
                }}
                title="Edit template"
              >
                ✏️
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>{template.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    margin: '0',
                    color: '#1e293b'
                  }}>
                    {template.title}
                  </h3>
                  {template.isCustom && (
                    <span style={{
                      fontSize: '10px',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Custom
                    </span>
                  )}
                </div>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#64748b',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  {template.description}
                </p>
                <div style={{
                  backgroundColor: '#f1f5f9',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#475569',
                  lineHeight: '1.4'
                }}>
                  <strong>Instructions:</strong> {template.definition}
                </div>
              </div>
            </div>
              <AiButton
                onClick={() => onStartReport(template)}
                variant="secondary"
                size="sm"
                style={{ 
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{ textAlign: 'center', width: '100%' }}>
                ➡︎ Start Report
                </div>
              </AiButton>
          </div>  
        ))}
      </div>
    </>
  );
} 