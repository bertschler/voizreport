'use client';

import React, { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import Mic2 from '../svg/Mic2';
import Microphone2 from '../svg/Microphone2';
import { Tab } from './TabNavigation';
import { isSessionActiveAtom, activeTemplateAtom, isConnectingAtom } from '@/app/state/voiceChatState';
import { ReportTemplate } from '../data/mockData';

interface DefaultFooterProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onNavigateToSession?: (template: ReportTemplate) => void;
}

export default function DefaultFooter({ tabs, activeTab, onTabChange, onNavigateToSession }: DefaultFooterProps) {
  const isSessionActive = useAtomValue(isSessionActiveAtom);
  const isConnecting = useAtomValue(isConnectingAtom);
  const activeTemplate = useAtomValue(activeTemplateAtom);

  // Add session animations to document head
  useEffect(() => {
    const id = 'session-mic-animations';
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
    `;
    document.head.appendChild(style);
  }, []);

  const handleMicClick = () => {
    if (isSessionActive && activeTemplate && onNavigateToSession) {
      // Navigate back to active session
      console.log('🎯 Returning to active session:', activeTemplate.title);
      onNavigateToSession(activeTemplate);
    } else {
      // Future: Start new session functionality
      console.log('🎤 Mic button clicked - ready for new session functionality!');
    }
  };

  // Determine mic button styling based on session state
  const getMicButtonStyle = () => {
    if (isConnecting) {
      return {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        animation: 'connectingBlink 1s infinite'
      };
    } else if (isSessionActive) {
      return {
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        animation: 'sessionPulse 2s infinite'
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        animation: 'micFloat 3s ease-in-out infinite'
      };
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Session Status Text - shown when recording */}
      {isSessionActive && activeTemplate && (
        <div style={{
          position: 'absolute',
          top: '-70px',
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

      {/* Floating Mic Button - positioned above footer */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10
      }}>
        <button
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            ...getMicButtonStyle()
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
        >
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
              animation: isConnecting ? 'connectingBlink 1s infinite' : 'recordingGlow 1.5s infinite',
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
            animation: isSessionActive ? 'none' : 'pulse 2s infinite'
          }} />
          
          {/* Mic Icon */}
          <Microphone2
            width={40}
            height={40}
            color="white"
          />
        </button>
      </div>

      {/* Tab Navigation Footer */}
      <div style={{
        height: '80px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
        paddingTop: '8px',
        paddingBottom: '8px'
      }}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 4px',
              transition: 'all 0.2s ease',
              // Add spacing around the center mic button
              marginLeft: index === 0 ? '0' : index === Math.floor(tabs.length / 2) ? '40px' : '0',
              marginRight: index === tabs.length - 1 ? '0' : index === Math.floor(tabs.length / 2) - 1 ? '40px' : '0'
            }}
          >
            {/* Tab Icon - using simple shapes for now */}
            <div style={{
              width: '24px',
              height: '24px',
              marginBottom: '4px',
              background: activeTab === tab.id ? '#8B5CF6' : '#9CA3AF',
              borderRadius: tab.id === 'templates' ? '6px' : '50%',
              transition: 'all 0.2s ease'
            }} />
            
            {/* Tab Label */}
            <span style={{
              fontSize: '12px',
              fontWeight: '500',
              color: activeTab === tab.id ? '#8B5CF6' : '#6B7280',
              transition: 'all 0.2s ease'
            }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* CSS Animation for pulse effect */}
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