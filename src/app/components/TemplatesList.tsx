'use client';

import React from 'react';
import AiButton from './AiButton';
import { ReportTemplate } from '../data/mockData';

interface TemplatesListProps {
  templates: ReportTemplate[];
  onStartReport: (template: ReportTemplate) => void;
  onCreateTemplate?: () => void;
}

export default function TemplatesList({ 
  templates, 
  onStartReport, 
  onCreateTemplate 
}: TemplatesListProps) {
  return (
    <>
      {/* Create Template Button */}
      <div style={{ marginBottom: '24px' }}>
        <AiButton
          onClick={onCreateTemplate}
          size="sm"
          variant="secondary"
          style={{ width: '100%' }}
        >
          ➕ Create New Template
        </AiButton>
      </div>

      {/* Templates List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {templates.map((template) => (
          <div key={template.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>{template.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  margin: '0 0 8px 0',
                  color: '#1e293b'
                }}>
                  {template.title}
                </h3>
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
              size="sm"
              style={{ width: '100%' }}
            >
              ✨ Start Report
            </AiButton>
          </div>
        ))}
      </div>
    </>
  );
} 