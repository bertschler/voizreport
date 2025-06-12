'use client';

import React from 'react';
import { useReports } from '../hooks/useReports';
import PhotoAttachmentViewer from './PhotoAttachmentViewer';
import { SubmittedReport } from "@/app/types/core";

interface SubmittedReportsProps {
  onViewDetails?: (report: SubmittedReport) => void;
}

export default function SubmittedReports({ 
  onViewDetails 
}: SubmittedReportsProps) {
  const { reports, markAsRead } = useReports();
  const [selectedReport, setSelectedReport] = React.useState<SubmittedReport | null>(null);

  const handleViewDetails = (report: SubmittedReport) => {
    // Mark as read if it was new
    if (report.isNew) {
      markAsRead(report.id);
    }
    
    if (onViewDetails) {
      onViewDetails(report);
    } else {
      // Show built-in details modal
      setSelectedReport(report);
    }
  };
  
  const getStatusColor = (status: SubmittedReport['status']) => {
    switch (status) {
      case 'Completed':
        return {
          backgroundColor: '#dcfce7',
          color: '#166534'
        };
      case 'Under Review':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e'
        };
      case 'Draft':
        return {
          backgroundColor: '#f3f4f6',
          color: '#374151'
        };
      default:
        return {
          backgroundColor: '#f3f4f6',
          color: '#374151'
        };
    }
  };

  if (reports.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: '#64748b'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#334155',
          margin: '0 0 8px 0'
        }}>
          No reports yet
        </h3>
        <p style={{ 
          fontSize: '14px', 
          margin: 0,
          lineHeight: '1.5'
        }}>
          Your completed voice reports will appear here. Create your first report using the templates in the Create tab.
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reports.map((report) => (
          <div key={report.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: report.isNew 
              ? '0 8px 25px rgba(139, 92, 246, 0.15), 0 3px 10px rgba(0,0,0,0.1)' 
              : '0 2px 8px rgba(0,0,0,0.04)',
            border: report.isNew 
              ? '2px solid transparent'
              : '1px solid #e2e8f0',
            background: report.isNew 
              ? 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #8B5CF6, #A855F7, #C084FC) border-box'
              : 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* New indicator with animated gradient */}
            {report.isNew && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #C084FC 100%)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                animation: 'pulse 2s infinite'
              }}>
                ✨ NEW
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: '8px',
              paddingRight: report.isNew ? '80px' : '0' // Make space for NEW badge
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: 0,
                color: '#1e293b'
              }}>
                {report.title}
              </h3>
              {!report.isNew && (
                <span style={{
                  ...getStatusColor(report.status),
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {report.status}
                </span>
              )}
            </div>
            
            <p style={{ 
              fontSize: '14px', 
              color: '#64748b',
              margin: '0 0 8px 0'
            }}>
              {report.templateType}
            </p>
            
            <p style={{ 
              fontSize: '13px', 
              color: '#64748b',
              margin: '0 0 8px 0',
              lineHeight: '1.4'
            }}>
              {report.summary}
            </p>

            {/* Photo attachments indicator */}
            {report.photoAttachments && report.photoAttachments.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px',
                padding: '6px 10px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <span style={{ fontSize: '14px' }}>📸</span>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#475569',
                  fontWeight: '500'
                }}>
                  {report.photoAttachments.length} photo attachment{report.photoAttachments.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            <div style={{ 
              fontSize: '12px', 
              color: '#94a3b8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>{report.date}</span>
                {report.isNew && (
                  <span style={{
                    ...getStatusColor(report.status),
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {report.status}
                  </span>
                )}
              </div>
              <button 
                onClick={() => handleViewDetails(report)}
                style={{
                  background: report.isNew 
                    ? 'linear-gradient(135deg, #8B5CF6, #A855F7)' 
                    : 'none',
                  border: 'none',
                  color: report.isNew ? 'white' : '#8B5CF6',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  padding: report.isNew ? '6px 12px' : '0',
                  borderRadius: report.isNew ? '8px' : '0',
                  boxShadow: report.isNew ? '0 2px 8px rgba(139, 92, 246, 0.2)' : 'none'
                }}
              >
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setSelectedReport(null)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0
              }}>
                {selectedReport.title}
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{
                fontSize: '16px',
                color: '#64748b',
                margin: '0 0 8px 0'
              }}>
                {selectedReport.templateType} • {selectedReport.date}
              </p>
            </div>

            {/* Show photo attachments if available */}
            {selectedReport.photoAttachments && selectedReport.photoAttachments.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <PhotoAttachmentViewer 
                  photoAttachments={selectedReport.photoAttachments}
                  maxWidth={300}
                  showFilenames={true}
                />
              </div>
            )}

            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#334155',
                margin: '0 0 12px 0'
              }}>
                Report Details
              </h3>
              <pre style={{
                fontSize: '13px',
                color: '#475569',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                whiteSpace: 'pre-wrap',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {JSON.stringify(selectedReport.json, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animation for the pulse effect */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
} 