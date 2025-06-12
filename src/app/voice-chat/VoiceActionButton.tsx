'use client';

import React from 'react';
import AiButton from '../components/AiButton';
import RecordingAnimation from './RecordingAnimation';

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
    minWidth: '200px',
    position: 'relative' as const,
    overflow: 'visible' as const
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
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
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
        {/* Recording Animation - positioned to the left inside button */}
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          opacity: isSessionActive ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}>
          <RecordingAnimation isVisible={isSessionActive} />
        </div>

        {/* Button text with left padding to make room for animation */}
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          paddingLeft: '32px' // Make room for the recording animation
        }}>
          Stop reporting
        </span>

        {/* Subtle pulse effect background */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          opacity: isSessionActive ? 1 : 0,
          animation: isSessionActive ? 'pulseGlow 2s ease-in-out infinite' : 'none',
          pointerEvents: 'none'
        }} />
      </button>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulseGlow {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.02);
          }
        }
      `}</style>
    </>
  );
} 