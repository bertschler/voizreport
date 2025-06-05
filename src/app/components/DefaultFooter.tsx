'use client';

import React from 'react';
import Mic2 from '../svg/Mic2';
import Microphone2 from '../svg/Microphone2';
import { Tab } from './TabNavigation';

interface DefaultFooterProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function DefaultFooter({ tabs, activeTab, onTabChange }: DefaultFooterProps) {
  return (
    <div style={{ position: 'relative' }}>
      {/* Floating Mic Button - positioned above footer */}
      <div style={{
        position: 'absolute',
        top: '-50px', // Positioned above the footer
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10
      }}>
        <button
          style={{
            width: '80px',
            height: '80px',
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