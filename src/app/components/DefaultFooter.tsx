'use client';

import React from 'react';
import { Tab } from './TabNavigation';
import SmartMicButton from './SmartMicButton';
import { ReportTemplate } from '../data/mockData';

interface DefaultFooterProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onNavigateToSession?: (template: ReportTemplate) => void;
  onStartNewSession?: () => void;
  onStopSession?: () => void;
  showTabs?: boolean; // Controls whether to show tab navigation
}

export default function DefaultFooter({ 
  tabs, 
  activeTab, 
  onTabChange, 
  onNavigateToSession,
  onStartNewSession,
  onStopSession,
  showTabs = true 
}: DefaultFooterProps) {
  return (
    <>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: translateX(-50%) scale(1.2);
          }
        }
      `}</style>
      
      <div style={{ position: 'relative'}}>
      {/* Floating Smart Mic Button - positioned above footer */}
      <div style={{
        position: 'absolute',
        top: '-20px', // Closer to footer when no tabs
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10
      }}>
        <SmartMicButton 
          onNavigateToSession={showTabs ? onNavigateToSession : undefined}
          onStartNewSession={onStartNewSession}
          onStopSession={!showTabs ? onStopSession : undefined}
        />
      </div>

      {/* Tab Navigation Footer - only show when not recording */}
      {showTabs && (
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
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '12px 4px',
                transition: 'all 0.2s ease',
                // Add spacing around the center mic button
                marginLeft: index === 0 ? '0' : index === Math.floor(tabs.length / 2) ? '40px' : '0',
                marginRight: index === tabs.length - 1 ? '0' : index === Math.floor(tabs.length / 2) - 1 ? '40px' : '0'
              }}
            >
              {/* Tab Icon */}
              <div style={{
                width: '52px',
                height: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                transform: activeTab === tab.id ? 'scale(1.25)' : 'scale(1)',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                border: activeTab === tab.id ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'
              }}>
                {/* Animated glow ring for active tab */}
                {activeTab === tab.id && (
                  <div style={{
                    position: 'absolute',
                    inset: '-4px',
                    borderRadius: '20px',
                    background: 'conic-gradient(from 0deg, #8B5CF6, #7C3AED, #6366F1, #8B5CF6)',
                    //animation: 'spin 3s linear infinite',
                    opacity: 0.2,
                    zIndex: -1,
                    filter: 'blur(2px)'
                  }} />
                )}
                
                <img 
                  src={tab.id === 'templates' ? '/create.png' : '/list.png'}
                  alt={tab.label}
                  style={{
                    width: '46px',
                    height: '46px',
                    filter: activeTab === tab.id 
                      ? '' 
                      : 'brightness(0) invert(0.4)',
                    transition: 'all 0.4s ease',
                    transform: activeTab === tab.id ? 'rotate(5deg)' : 'rotate(0deg)'
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Recording Focus Footer - minimal background when recording */}
      {!showTabs && (
        <div style={{
          height: '80px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          position: 'relative',
          zIndex: 1
        }} />
      )}
    </div>
    </>
  );
} 