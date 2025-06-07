'use client';

import React from 'react';
import Image from 'next/image';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  sticky?: boolean;
  onSettingsClick?: () => void;
  showLogo?: boolean;
}

export default function MobileHeader({ 
  title, 
  subtitle, 
  showBackButton = false, 
  onBackClick,
  sticky = false,
  onSettingsClick,
  showLogo = true
}: MobileHeaderProps) {
  const headerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: showBackButton ? '16px 20px' : '20px',
    borderBottom: '1px solid #e2e8f0',
    ...(sticky && {
      position: 'sticky',
      top: 0,
      zIndex: 10
    })
  };

  return (
    <div style={headerStyle}>
      {showBackButton ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onBackClick}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
              color: '#1e293b'
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{ 
              fontSize: '18px', 
              fontWeight: '600',
              margin: 0,
              color: '#1e293b'
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ 
                fontSize: '14px', 
                color: '#64748b',
                margin: '4px 0 0 0'
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {showLogo && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '2px'
              }}>
                <Image
                  src="/appicon.png"
                  alt="App Icon"
                  width={48}
                  height={48}
                  style={{
                    //borderRadius: '6px',
                    objectFit: 'contain',
                    //boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}
                />
              </div>
            )}
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '700',
                margin: 0,
                color: '#1e293b'
              }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ 
                  fontSize: '16px', 
                  color: '#64748b',
                  margin: '4px 0 0 0'
                }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Settings button - subtle and tertiary */}
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '8px',
                color: '#94a3b8',
                borderRadius: '6px',
                transition: 'all 0.2s',
                opacity: 0.7
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.opacity = '0.7';
              }}
              title="Settings"
            >
              ⚙️
            </button>
          )}
        </div>
      )}
    </div>
  );
} 