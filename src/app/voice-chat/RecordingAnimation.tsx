'use client';

import React from 'react';

interface RecordingAnimationProps {
  isVisible: boolean;
}

export default function RecordingAnimation({ isVisible }: RecordingAnimationProps) {
  if (!isVisible) return null;

  return (
    <>
      <div style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center'
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '4px',
              height: '20px',
              backgroundColor: '#ef4444',
              borderRadius: '2px',
              animation: `soundwave 1.5s ease-in-out ${i * 0.2}s infinite`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes soundwave {
          0%, 100% { height: 4px; opacity: 0.4; }
          50% { height: 20px; opacity: 1; }
        }
      `}</style>
    </>
  );
} 