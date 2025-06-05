'use client';

import React from 'react';
import Image from 'next/image';
import Mic2 from '../svg/Mic2';
import Microphone2 from '../svg/Microphone2';

export default function DefaultFooter() {
  return (
    <div style={{ position: 'relative' }}>
      {/* Main Footer with translucent blurry background */}
      <div style={{
        height: '80px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Mic Button - positioned to extend above footer */}
        <div style={{
          position: 'absolute',
          top: '-40px', // Half of the button extends above footer
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2
        }}>
          <button
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 48px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onClick={() => {
              console.log('🎤 Mic button clicked - ready for future functionality!');
            }}
          >
            {/* Subtle pulse animation background */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              animation: 'pulse 2s infinite'
            }} />
            
            {/* Mic Icon */}
            <Microphone2
              width={56}
              height={56}
              color="white"
            />
          </button>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
} 