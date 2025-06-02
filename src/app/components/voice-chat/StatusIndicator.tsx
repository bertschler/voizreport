'use client';

import React from 'react';

interface StatusIndicatorProps {
  isConnecting: boolean;
  isSessionActive: boolean;
}

export default function StatusIndicator({ isConnecting, isSessionActive }: StatusIndicatorProps) {
  return (
    <>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        transition: 'all 0.3s ease',
        ...(isConnecting ? {
          background: 'linear-gradient(45deg, #f3f4f6, #e5e7eb)',
          animation: 'pulse 2s infinite',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          opacity: 1
        } : isSessionActive ? {
          background: 'linear-gradient(45deg, #dcfce7, #bbf7d0)',
          boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
          opacity: 1
        } : {
          background: 'linear-gradient(45deg, #f8fafc, #f1f5f9)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          opacity: 0
        })
      }}>
        {isConnecting ? '⚡' : isSessionActive ? '🎤' : '💬'}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
} 