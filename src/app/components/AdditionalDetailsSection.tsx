'use client';

import React, { useState } from 'react';

interface AdditionalDetailsSectionProps {
  transcription: string;
  jsonData: Record<string, any>;
  onCopy: (content: string) => void;
  copied: boolean;
}

export default function AdditionalDetailsSection({ 
  transcription, 
  jsonData, 
  onCopy, 
  copied 
}: AdditionalDetailsSectionProps) {
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);

  return (
    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
      <button
        onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
        style={{
          backgroundColor: 'transparent',
          color: '#64748b',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          cursor: 'pointer',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
          width: '100%',
          justifyContent: 'space-between'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f8fafc';
          e.currentTarget.style.borderColor = '#cbd5e1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📄</span>
          <span>Additional Details</span>
          <span style={{ 
            fontSize: '12px', 
            color: '#94a3b8',
            backgroundColor: '#f1f5f9',
            padding: '2px 6px',
            borderRadius: '10px'
          }}>
            Transcription & Raw Data
          </span>
        </div>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{ 
            transform: showAdditionalDetails ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s ease' 
          }}
        >
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>

      {showAdditionalDetails && (
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fafbfc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          {/* Transcription Section */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '16px'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                📝 Transcription
              </h4>
              <button
                onClick={() => onCopy(transcription)}
                style={{
                  backgroundColor: copied ? '#10b981' : '#8B5CF6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
              
            <div style={{
              position: 'relative',
              backgroundColor: '#fefbf7',
              backgroundImage: `
                linear-gradient(90deg, #f0f0f0 1px, transparent 1px),
                linear-gradient(180deg, #f0f0f0 1px, transparent 1px),
                radial-gradient(circle at 20% 80%, rgba(120,119,198,0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120,119,198,0.05) 0%, transparent 50%)
              `,
              backgroundSize: '20px 20px, 20px 20px, 100% 100%, 100% 100%, 100% 100%',
              border: '1px solid #e8e0d6',
              borderRadius: '8px',
              padding: '40px 50px 40px 80px',
              maxHeight: '300px',
              overflowY: 'auto',
              boxShadow: `
                0 1px 3px rgba(0,0,0,0.1),
                0 4px 6px rgba(0,0,0,0.05),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `
            }}>
              {/* Red margin line */}
              <div style={{
                position: 'absolute',
                left: '60px',
                top: '0',
                bottom: '0',
                width: '2px',
                backgroundColor: '#ff6b6b',
                opacity: '0.7'
              }} />
              
              {/* Hole punch effects */}
              <div style={{
                position: 'absolute',
                left: '15px',
                top: '30px',
                width: '8px',
                height: '8px',
                backgroundColor: 'white',
                borderRadius: '50%',
                border: '1px solid #ddd',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
              }} />
              <div style={{
                position: 'absolute',
                left: '15px',
                top: '80px',
                width: '8px',
                height: '8px',
                backgroundColor: 'white',
                borderRadius: '50%',
                border: '1px solid #ddd',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
              }} />
              <div style={{
                position: 'absolute',
                left: '15px',
                top: '130px',
                width: '8px',
                height: '8px',
                backgroundColor: 'white',
                borderRadius: '50%',
                border: '1px solid #ddd',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
              }} />
              
              {/* Paper clip effect */}
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '80px',
                width: '30px',
                height: '60px',
                background: 'linear-gradient(135deg, #c0c0c0 0%, #silver 50%, #808080 100%)',
                clipPath: 'polygon(20% 0%, 80% 0%, 85% 15%, 80% 30%, 75% 30%, 80% 15%, 25% 15%, 25% 85%, 80% 85%, 75% 100%, 20% 100%, 15% 85%, 20% 70%, 25% 70%, 20% 85%, 75% 85%, 75% 15%, 20% 15%)',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                transform: 'rotate(-5deg)'
              }} />
              
              <pre style={{
                fontSize: '14px',
                fontFamily: '"Courier New", "Lucida Console", monospace',
                lineHeight: '1.6',
                color: '#2d3748',
                whiteSpace: 'pre-wrap',
                margin: 0,
                textShadow: '0 0 1px rgba(0,0,0,0.1)',
                letterSpacing: '0.3px'
              }}>
                {transcription}
              </pre>
            </div>
          </div>

          {/* Raw Data Section */}
          <div style={{ paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                🔧 Raw Data (JSON)
              </h4>
              <button
                onClick={() => onCopy(JSON.stringify(jsonData, null, 2))}
                style={{
                  backgroundColor: copied ? '#10b981' : '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
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
              borderRadius: '8px',
              padding: '16px',
              fontSize: '11px',
              fontFamily: 'ui-monospace, monospace',
              lineHeight: '1.4',
              color: '#475569',
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 