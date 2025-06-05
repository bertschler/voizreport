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
  showTabs?: boolean; // Controls whether to show tab navigation
}

export default function DefaultFooter({ 
  tabs, 
  activeTab, 
  onTabChange, 
  onNavigateToSession,
  onStartNewSession,
  showTabs = true 
}: DefaultFooterProps) {
  return (
    <div style={{ position: 'relative' }}>
      {/* Floating Smart Mic Button - positioned above footer */}
      <div style={{
        position: 'absolute',
        top: '-20px', // Closer to footer when no tabs
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10
      }}>
        <SmartMicButton 
          onNavigateToSession={onNavigateToSession}
          onStartNewSession={onStartNewSession}
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
  );
} 