'use client';

import React, { useState } from 'react';
import { SubmittedReport, reportTemplates } from '../data/mockData';
import FormFieldsDisplay from './FormFieldsDisplay';
import AdditionalDetailsSection from './AdditionalDetailsSection';

interface ReportDetailsPageProps {
  report: SubmittedReport | null;
  onBack: () => void;
}

export default function ReportDetailsPage({ report, onBack }: ReportDetailsPageProps) {
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const handleDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDropdownOpen(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: report.summary,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      await handleCopy(`${report.title}\n\n${report.summary}`);
    }
  };

  const downloadOptions = [
    {
      label: 'Plain Text (.txt)',
      action: () => handleDownload(report.plainText, `${report.title.replace(/\s+/g, '_')}.txt`, 'text/plain')
    },
    {
      label: 'JSON (.json)',
      action: () => handleDownload(JSON.stringify(report.json, null, 2), `${report.title.replace(/\s+/g, '_')}.json`, 'application/json')
    }
  ];

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
    const template = reportTemplates.find(t => t.title === report.templateType);
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

      {/* Footer Actions */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              backgroundColor: '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
            >
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
          
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              marginBottom: '4px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              zIndex: 1001,
              minWidth: '180px'
            }}>
              {downloadOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={option.action}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    fontSize: '14px',
                    color: '#374151',
                    cursor: 'pointer',
                    borderRadius: index === 0 ? '8px 8px 0 0' : index === downloadOptions.length - 1 ? '0 0 8px 8px' : '0',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleShare}
            style={{
              backgroundColor: '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16,6 12,2 8,6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Share
          </button>
          <button
            onClick={onBack}
            style={{
              backgroundColor: '#e2e8f0',
              color: '#64748b',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
        </div>
      </div>
      
      {/* Backdrop to close dropdown */}
      {dropdownOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
} 