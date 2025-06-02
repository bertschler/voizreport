'use client';

import React from 'react';
import AiButton from '../AiButton';

interface VoiceActionButtonProps {
  isSessionActive: boolean;
  isConnecting: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function VoiceActionButton({ 
  isSessionActive, 
  isConnecting, 
  onStart, 
  onStop 
}: VoiceActionButtonProps) {
  const buttonStyle = {
    padding: '16px 32px',
    fontSize: '18px',
    borderRadius: '24px',
    minWidth: '200px'
  };

  if (!isSessionActive) {
    return (
      <AiButton
        onClick={onStart}
        loading={isConnecting}
        style={buttonStyle}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isConnecting ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid currentColor',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Setting up...
            </>
          ) : (
            <>Start reporting</>
          )}
        </span>
      </AiButton>
    );
  }

  return (
    <>
      <button
        onClick={onStop}
        style={{
          ...buttonStyle,
          background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
          color: 'white',
          border: 'none',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Stop reporting
        </span>
      </button>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
} 