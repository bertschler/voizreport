'use client';

import React, { useState, useEffect } from 'react';
import { SubmittedReport } from '../data/mockData';

interface ReportDetailsModalProps {
  report: SubmittedReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportDetailsModal({ report, isOpen, onClose }: ReportDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'plaintext' | 'markdown' | 'json'>('overview');
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200); // Wait for animation to complete
  };

  if (!isOpen || !report) return null;

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
      label: 'Markdown (.md)',
      action: () => handleDownload(report.markdown, `${report.title.replace(/\s+/g, '_')}.md`, 'text/markdown')
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: `rgba(0, 0, 0, ${isAnimating ? '0.5' : '0'})`,
      backdropFilter: `blur(${isAnimating ? '4px' : '0px'})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        transform: `scale(${isAnimating ? '1' : '0.95'}) translateY(${isAnimating ? '0' : '20px'})`,
        opacity: isAnimating ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                margin: '0 0 8px 0',
                lineHeight: '1.2'
              }}>
                {report.title}
              </h2>
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
            <button
              onClick={handleClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '12px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '20px',
                marginLeft: '16px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          {[
            { key: 'overview', label: 'Overview', icon: '📋' },
            { key: 'plaintext', label: 'Plain Text', icon: '📄' },
            { key: 'markdown', label: 'Markdown', icon: '📝' },
            { key: 'json', label: 'JSON', icon: '🔧' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                padding: '16px 20px',
                border: 'none',
                backgroundColor: activeTab === tab.key ? 'white' : 'transparent',
                borderBottom: activeTab === tab.key ? '3px solid #8B5CF6' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: activeTab === tab.key ? '#8B5CF6' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          padding: '32px',
          overflowY: 'auto',
          maxHeight: '50vh'
        }}>
          {activeTab === 'overview' && (
            <div style={{ lineHeight: '1.6' }}>
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
              
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  color: '#1e293b'
                }}>
                  Report Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Report ID:</span>
                    <p style={{ fontSize: '14px', color: '#1e293b', margin: '4px 0 0 0', fontFamily: 'monospace' }}>
                      {`report-${report.id}-${Date.now()}`}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Completed:</span>
                    <p style={{ fontSize: '14px', color: '#1e293b', margin: '4px 0 0 0' }}>
                      {report.json?.completed_at ? new Date(report.json.completed_at).toLocaleString() : report.date}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Fields Completed:</span>
                    <p style={{ fontSize: '14px', color: '#1e293b', margin: '4px 0 0 0' }}>
                      {report.json?.completed_fields?.length || 'N/A'} fields
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Source:</span>
                    <p style={{ fontSize: '14px', color: '#1e293b', margin: '4px 0 0 0' }}>
                      {report.json?.source === 'voiz_voice_ai' ? 'Voice AI Interface' : 'Voice AI Interface'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plaintext' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                  Plain Text Format
                </h3>
                <button
                  onClick={() => handleCopy(report.plainText)}
                  style={{
                    backgroundColor: copied ? '#10b981' : '#8B5CF6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
              <pre style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '14px',
                fontFamily: 'ui-monospace, monospace',
                lineHeight: '1.6',
                color: '#1e293b',
                whiteSpace: 'pre-wrap',
                overflow: 'auto'
              }}>
                {report.plainText}
              </pre>
            </div>
          )}

          {activeTab === 'markdown' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                  Markdown Format
                </h3>
                <button
                  onClick={() => handleCopy(report.markdown)}
                  style={{
                    backgroundColor: copied ? '#10b981' : '#8B5CF6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
              <pre style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '14px',
                fontFamily: 'ui-monospace, monospace',
                lineHeight: '1.6',
                color: '#1e293b',
                whiteSpace: 'pre-wrap',
                overflow: 'auto'
              }}>
                {report.markdown}
              </pre>
            </div>
          )}

          {activeTab === 'json' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                  JSON Format
                </h3>
                <button
                  onClick={() => handleCopy(JSON.stringify(report.json, null, 2))}
                  style={{
                    backgroundColor: copied ? '#10b981' : '#8B5CF6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
              <pre style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '13px',
                fontFamily: 'ui-monospace, monospace',
                lineHeight: '1.5',
                color: '#1e293b',
                whiteSpace: 'pre-wrap',
                overflow: 'auto'
              }}>
                {JSON.stringify(report.json, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '24px 32px',
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
              onClick={handleClose}
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
              Close
            </button>
          </div>
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