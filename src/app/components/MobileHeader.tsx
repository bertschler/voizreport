'use client';

import React from 'react';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  sticky?: boolean;
  onSettingsClick?: () => void;
}

export default function MobileHeader({ 
  title, 
  subtitle, 
  showBackButton = false, 
  onBackClick,
  sticky = false,
  onSettingsClick
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