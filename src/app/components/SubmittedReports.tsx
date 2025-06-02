'use client';

import React from 'react';
import { SubmittedReport } from '../data/mockData';

interface SubmittedReportsProps {
  reports: SubmittedReport[];
  onViewDetails?: (report: SubmittedReport) => void;
}

export default function SubmittedReports({ 
  reports, 
  onViewDetails 
}: SubmittedReportsProps) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {reports.map((report) => (
        <div key={report.id} style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '8px' 
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              margin: 0,
              color: '#1e293b'
            }}>
              {report.title}
            </h3>
            <span style={{
              ...getStatusColor(report.status),
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {report.status}
            </span>
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
            margin: '0 0 12px 0',
            lineHeight: '1.4'
          }}>
            {report.summary}
          </p>
          
          <div style={{ 
            fontSize: '12px', 
            color: '#94a3b8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{report.date}</span>
            <button 
              onClick={() => onViewDetails?.(report)}
              style={{
                background: 'none',
                border: 'none',
                color: '#8B5CF6',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              View Details →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 