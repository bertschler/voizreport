'use client';

import React from 'react';

interface StatusTextProps {
  isConnecting: boolean;
  isSessionActive: boolean;
}

export default function StatusText({ isConnecting, isSessionActive }: StatusTextProps) {
  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (isSessionActive) return 'Recording';
    return 'Ready to start';
  };

  const getStatusColor = () => {
    if (isConnecting) return '#8B5CF6';
    if (isSessionActive) return '#059669';
    return '#64748b';
  };

  return (
    <div style={{
      fontSize: '16px',
      fontWeight: '500',
      color: getStatusColor()
    }}>
      {getStatusText()}
    </div>
  );
} 