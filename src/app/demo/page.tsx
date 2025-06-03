'use client';

import React, { useState } from 'react';
import LiveVoiceChat, { FormSummary } from '../components/LiveVoiceChat';

export default function DemoPage() {
  const [completedForms, setCompletedForms] = useState<FormSummary[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'plain' | 'markdown' | 'json'>('plain');

  const handleFormCompletion = (summary: FormSummary) => {
    console.log('📋 Form completed!', summary);
    setCompletedForms(prev => [...prev, summary]);
    
    // You could also send this to your backend here
    // await fetch('/api/reports', { method: 'POST', body: JSON.stringify(summary.json) });
  };

  const handleSessionReady = (sessionId: string) => {
    console.log('🎤 Voice session ready:', sessionId);
  };

  const renderSummary = (summary: FormSummary) => {
    switch (selectedFormat) {
      case 'markdown':
        return <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px' }}>{summary.markdown}</pre>;
      case 'json':
        return <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px' }}>{JSON.stringify(summary.json, null, 2)}</pre>;
      default:
        return <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px' }}>{summary.plainText}</pre>;
    }
  };

  const downloadSummary = (summary: FormSummary, format: string) => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'markdown':
        content = summary.markdown;
        filename = `report-${summary.sessionId}-${summary.timestamp}.md`;
        mimeType = 'text/markdown';
        break;
      case 'json':
        content = JSON.stringify(summary.json, null, 2);
        filename = `report-${summary.sessionId}-${summary.timestamp}.json`;
        mimeType = 'application/json';
        break;
      default:
        content = summary.plainText;
        filename = `report-${summary.sessionId}-${summary.timestamp}.txt`;
        mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Voice Chat Interface */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px 24px 0',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
              color: '#1f2937'
            }}>
              Voiz.report Voice AI Demo
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 16px 0'
            }}>
              Complete healthcare reports using voice with automatic form completion detection
            </p>
          </div>
          
          <LiveVoiceChat 
            onSessionReady={handleSessionReady}
            onFormCompleted={handleFormCompletion}
            templateInstructions="This is a healthcare worker home visit report. Collect patient vitals, observations, and care details systematically. When you have collected all necessary information, call the complete_form_submission function with the extracted data."
          />
        </div>

        {/* Completed Forms Display */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              margin: 0,
              color: '#1f2937'
            }}>
              Completed Reports ({completedForms.length})
            </h2>
            
            {completedForms.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select 
                  value={selectedFormat} 
                  onChange={(e) => setSelectedFormat(e.target.value as any)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    fontSize: '14px'
                  }}
                >
                  <option value="plain">Plain Text</option>
                  <option value="markdown">Markdown</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            )}
          </div>

          {completedForms.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: '#6b7280',
              border: '2px dashed #e5e7eb',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎤</div>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                No reports completed yet
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                Start a voice session to create your first report. The system will automatically detect when the form is completed and provide you with the summary in multiple formats.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {completedForms.map((summary, index) => (
                <div key={`${summary.sessionId}-${summary.timestamp}`} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        Report #{completedForms.length - index}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginLeft: '12px'
                      }}>
                        Session: {summary.sessionId}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {new Date(summary.timestamp).toLocaleString()}
                      </span>
                      <button
                        onClick={() => downloadSummary(summary, selectedFormat)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Download {selectedFormat.toUpperCase()}
                      </button>
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '12px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}>
                    {renderSummary(summary)}
                  </div>
                  
                  {/* Show field completion status */}
                  <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#0369a1'
                  }}>
                    <strong>Completed fields:</strong> {summary.json.completed_fields?.join(', ') || 'None detected'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        maxWidth: '1200px',
        margin: '32px auto 0',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0', color: '#1f2937' }}>
          How to Test Form Completion Detection
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: '#374151' }}>
              Automatic Detection:
            </h4>
            <ul style={{ fontSize: '14px', color: '#6b7280', margin: 0, paddingLeft: '20px' }}>
              <li>The AI automatically calls a 'complete_form_submission' function when form is ready</li>
              <li>Function calling is more reliable than pattern matching completion phrases</li>
              <li>Session ends automatically 3 seconds after function call completion</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: '#374151' }}>
              Output Formats:
            </h4>
            <ul style={{ fontSize: '14px', color: '#6b7280', margin: 0, paddingLeft: '20px' }}>
              <li><strong>Plain Text:</strong> Simple key-value pairs</li>
              <li><strong>Markdown:</strong> Formatted report with headers</li>
              <li><strong>JSON:</strong> Structured data with metadata</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 