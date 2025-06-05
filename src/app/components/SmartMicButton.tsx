'use client';

import React, { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import Microphone2 from '../svg/Microphone2';
import { isSessionActiveAtom, activeTemplateAtom, isConnectingAtom } from '@/app/state/voiceChatState';
import { ReportTemplate } from '../data/mockData';

interface SmartMicButtonProps {
  onNavigateToSession?: (template: ReportTemplate) => void;
  onStartNewSession?: () => void;
  onStopSession?: () => void;
}

export default function SmartMicButton({ onNavigateToSession, onStartNewSession, onStopSession }: SmartMicButtonProps) {
  const isSessionActive = useAtomValue(isSessionActiveAtom);
  const isConnecting = useAtomValue(isConnectingAtom);
  const activeTemplate = useAtomValue(activeTemplateAtom);

  // Add session animations to document head
  useEffect(() => {
    const id = 'smart-mic-animations';
    if (document.getElementById(id)) return;
    
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes sessionPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4); }
        50% { transform: scale(1.02); box-shadow: 0 12px 48px rgba(5, 150, 105, 0.6); }
      }
      
      @keyframes connectingBlink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.7; }
      }
      
      @keyframes recordingGlow {
        0%, 100% { box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4); }
        50% { box-shadow: 0 12px 48px rgba(239, 68, 68, 0.8); }
      }
      
      @keyframes micFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-2px); }
      }
      
      @keyframes micPulse {
        0% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
        100% { opacity: 0.6; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const handleMicClick = () => {
    if (isSessionActive && activeTemplate) {
      if (onStopSession) {
        // Stop current session (when used in LiveVoiceChat)
        console.log('🛑 Stopping current session:', activeTemplate.title);
        onStopSession();
      } else if (onNavigateToSession) {
        // Navigate back to active session (when used in footer)
        console.log('🎯 Returning to active session:', activeTemplate.title);
        onNavigateToSession(activeTemplate);
      }
    } else if (onStartNewSession) {
      // Start new session
      console.log('🎤 Starting new session...');
      onStartNewSession();
    } else {
      // Fallback - ready for future functionality
      console.log('🎤 Mic button clicked - ready for session functionality!');
    }
  };

  // Determine animation based on session state
  const getAnimation = () => {
    if (isConnecting) {
      return 'none'; // No blinking, just smooth color transition
    } else if (isSessionActive) {
      return 'sessionPulse 2s infinite';
    } else {
      return 'micFloat 3s ease-in-out infinite';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Session Status Text - shown when recording */}
      {isSessionActive && activeTemplate && (
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600',
          zIndex: 9,
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {isConnecting ? 'Connecting...' : `Recording: ${activeTemplate.title}`}
        </div>
      )}

      {/* Smart Mic Button */}
      <button
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          background: 'transparent',
          animation: getAnimation()
        }}
        onMouseEnter={(e) => {
          if (!isSessionActive) {
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSessionActive) {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = isSessionActive ? 'scale(1)' : 'scale(1.05)';
        }}
        onClick={handleMicClick}
        aria-label={
          isConnecting 
            ? 'Connecting to voice session' 
            : isSessionActive 
              ? (onStopSession ? `Stop recording: ${activeTemplate?.title}` : `Return to recording: ${activeTemplate?.title}`)
              : 'Start voice recording'
        }
      >
        {/* Default Background Gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: (!isSessionActive && !isConnecting) ? 1 : 0,
          transition: 'opacity 0.5s ease'
        }} />

        {/* Connecting Background Gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          opacity: isConnecting ? 1 : 0,
          transition: 'opacity 0.5s ease'
        }} />

        {/* Active Session Background Gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          opacity: (isSessionActive && !isConnecting) ? 1 : 0,
          transition: 'opacity 0.5s ease'
        }} />

        {/* Recording dot indicator */}
        {isSessionActive && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '12px',
            height: '12px',
            background: '#ff4444',
            borderRadius: '50%',
            animation: isConnecting ? 'none' : 'recordingGlow 1.5s infinite',
            zIndex: 2
          }} />
        )}
        
        {/* Pulse animation background */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: isSessionActive ? 'none' : 'micPulse 2s infinite',
          zIndex: 5
        }} />
        
        {/* Mic Icon */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Microphone2
            width={60}
            height={60}
            color="white"
          />
        </div>
      </button>
    </div>
  );
} 