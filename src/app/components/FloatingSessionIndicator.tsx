'use client';

import React, { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { isSessionActiveAtom, activeTemplateAtom, isConnectingAtom } from '@/app/state/voiceChatState';
import { ReportTemplate } from '@/app/data/mockData';

// Add CSS animations
const addStylesheet = () => {
  const id = 'floating-session-animations';
  if (document.getElementById(id)) return;
  
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    @keyframes sessionPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    
    @keyframes sessionBlink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.3; }
    }
    
    @keyframes recordingDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.2); }
    }
  `;
  document.head.appendChild(style);
};

interface FloatingSessionIndicatorProps {
  onNavigateToSession: (template: ReportTemplate) => void;
}

export default function FloatingSessionIndicator({ onNavigateToSession }: FloatingSessionIndicatorProps) {
  const isSessionActive = useAtomValue(isSessionActiveAtom);
  const isConnecting = useAtomValue(isConnectingAtom);
  const activeTemplate = useAtomValue(activeTemplateAtom);

  // Add animations to document head
  useEffect(() => {
    addStylesheet();
  }, []);

  // Don't show if no active session or no template
  if (!isSessionActive || !activeTemplate) {
    return null;
  }

  const handleClick = () => {
    onNavigateToSession(activeTemplate);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: '80px',
        right: '16px',
        backgroundColor: '#059669',
        color: 'white',
        padding: '10px 14px',
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
        cursor: 'pointer',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        fontWeight: '600',
        maxWidth: '240px',
        animation: 'sessionPulse 2s infinite',
        transition: 'all 0.2s ease',
        border: '2px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* Recording animation dot */}
      <div
        style={{
          width: '8px',
          height: '8px',
          backgroundColor: '#ff4444',
          borderRadius: '50%',
          animation: isConnecting ? 'sessionBlink 1s infinite' : 'recordingDot 1.5s infinite'
        }}
      />
      
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {isConnecting ? 'Connecting...' : `Recording: ${activeTemplate.title}`}
      </span>
      
      <span style={{ fontSize: '16px' }}>🎤</span>


    </div>
  );
} 