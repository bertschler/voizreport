'use client';

import React, { useState } from 'react';
import { useAtomValue } from 'jotai';
import { SubmittedReport } from '../data/mockData';
import { templatesAtom } from '../state/templatesState';
import FormFieldsDisplay from './FormFieldsDisplay';
import AdditionalDetailsSection from './AdditionalDetailsSection';
import PhotoAttachmentViewer from './PhotoAttachmentViewer';

interface ReportDetailsPageProps {
  report: SubmittedReport | null;
  onBack?: () => void; // Made optional since footer handles this now
}

export default function ReportDetailsPage({ report }: ReportDetailsPageProps) {
  const [copied, setCopied] = useState(false);
  const templates = useAtomValue(templatesAtom);

  if (!report) return null;

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };



  const getStatusColor = (status: SubmittedReport['status']) => {
    switch (status) {
      case 'Completed':
        return { bg: '#dcfce7', text: '#166534' };
      case 'Under Review':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'Draft':
        return { bg: '#f3f4f6', text: '#374151' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const statusColors = getStatusColor(report.status);

  // Get compact transcription from report data
  const compactTranscription = report.json?.compact_transcription || report.plainText;

  // Helper function to extract form fields from template
  const getFormFields = () => {
    const template = templates.find(t => t.title === report.templateType);

    console.log('template', template);

    if (!template) return [];
    
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
  const formProgress = report.json?.data || {};

  return (
    <div style={{ minHeight: '100%', backgroundColor: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid #e2e8f0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ 
                fontSize: '14px', 
                opacity: 0.9,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '20px'
              }}>
                {report.templateType}
              </span>
              <span style={{ 
                fontSize: '14px', 
                opacity: 0.9,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '20px'
              }}>
                {report.date}
              </span>
              <span style={{
                backgroundColor: statusColors.bg,
                color: statusColors.text,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {report.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '20px',
        lineHeight: '1.6'
      }}>
        {/* Report Summary */}
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#1e293b'
        }}>
          Report Summary
        </h3>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748b', 
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          {report.summary}
        </p>

        {/* Photo Attachments Section */}
        {report.photoAttachments && report.photoAttachments.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <PhotoAttachmentViewer 
              photoAttachments={report.photoAttachments}
              maxWidth={400}
              showFilenames={true}
            />
          </div>
        )}

        {/* Form Fields Display Section */}
        {formFields.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <FormFieldsDisplay 
              formFields={formFields} 
              formProgress={formProgress} 
            />
          </div>
        )}
        
        {/* Additional Details Section */}
        <AdditionalDetailsSection
          transcription={compactTranscription}
          jsonData={report.json}
          onCopy={handleCopy}
          copied={copied}
        />
      </div>
    </div>
  );
} 