'use client';

import React, { ReactNode } from 'react';

interface AiButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export default function AiButton({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  style = {}
}: AiButtonProps) {
  const isDisabled = disabled || loading;

  // Size configurations
  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '14px', borderRadius: '8px' },
    md: { padding: '12px 24px', fontSize: '16px', borderRadius: '12px' },
    lg: { padding: '16px 32px', fontSize: '18px', borderRadius: '16px' }
  };

  // Variant configurations
  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #8B5CF6, #3B82F6, #06B6D4)',
      hoverBackground: 'linear-gradient(135deg, #7C3AED, #2563EB, #0891B2)',
      boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
      hoverBoxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)',
      color: 'white',
      border: 'none'
    },
    secondary: {
      background: 'rgba(139, 92, 246, 0.08)',
      hoverBackground: 'rgba(139, 92, 246, 0.15)',
      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)',
      hoverBoxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)',
      color: '#8B5CF6',
      border: '1px solid rgba(139, 92, 246, 0.2)'
    }
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    ...currentSize,
    background: currentVariant.background,
    color: currentVariant.color,
    fontWeight: '600',
    border: currentVariant.border,
    boxShadow: currentVariant.boxShadow,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transform: 'translateY(0)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    opacity: isDisabled ? 0.6 : 1,
    ...style
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
      e.currentTarget.style.boxShadow = currentVariant.hoverBoxShadow;
      e.currentTarget.style.background = currentVariant.hoverBackground;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = currentVariant.boxShadow;
      e.currentTarget.style.background = currentVariant.background;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={baseStyle}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span style={{ 
        position: 'relative', 
        zIndex: 10, 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {children}
      </span>
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none'
        }}
      />
    </button>
  );
} 