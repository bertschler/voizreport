'use client';

import React from 'react';
import { useCurrentTurn } from '@/app/hooks/useCurrentTurn';
import { useVoiceChat } from '../hooks/useVoiceChat';

/**
 * Professional turn indicator component with sophisticated design
 * Displays whose turn it is in the conversation with modern styling
 */
export function TurnIndicator() {
  const { currentTurn, isUserTurn, isAssistantTurn, isIdle, isActive } = useCurrentTurn();
  const { isSessionActive } = useVoiceChat();

  const getTurnStyles = () => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      letterSpacing: '0.025em',
      transition: 'all 0.3s ease',
      position: 'relative' as const,
      overflow: 'hidden' as const,
      marginBottom: '16px',
    };

    // Override with connecting state if session is not active
    if (!isSessionActive) {
      return {
        ...baseStyles,
        color: '#9ca3af',
        borderColor: 'rgba(156, 163, 175, 0.1)',
      };
    }

    switch (currentTurn) {
      case 'user':
        return {
          ...baseStyles,
          color: '#1e40af',
        };
      case 'assistant':
        return {
          ...baseStyles,
          color: '#047857',
        };
      case 'idle':
        return {
          ...baseStyles,
        };
      default:
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.08) 0%, rgba(75, 85, 99, 0.04) 100%)',
          color: '#6b7280',
          borderColor: 'rgba(107, 114, 128, 0.15)',
          boxShadow: '0 2px 8px rgba(107, 114, 128, 0.08)',
        };
    }
  };

  const getIndicatorStyles = () => {
    const baseIndicatorStyles = {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      position: 'relative' as const,
      flexShrink: 0,
    };

    // Override with connecting state if session is not active
    if (!isSessionActive) {
      return {
        ...baseIndicatorStyles,
      };
    }

    switch (currentTurn) {
      case 'user':
        return {
          ...baseIndicatorStyles,
          background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
        };
      case 'assistant':
        return {
          ...baseIndicatorStyles,
          background: 'linear-gradient(45deg, #10b981, #059669)',
        };
      case 'idle':
        return {
          ...baseIndicatorStyles,
          background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
        };
      default:
        return {
          ...baseIndicatorStyles,
          background: '#9ca3af',
        };
    }
  };

  const getStatusText = () => {
    if (!isSessionActive) return 'Connecting';
    if (isUserTurn) return 'Speaking';
    if (isAssistantTurn) return 'Responding';
    if (isIdle) return 'Listening';
    return 'Unknown';
  };

  const pulseKeyframes = `
    @keyframes sophisticatedPulse {
      0%, 100% { 
        transform: scale(1);
        opacity: 1;
      }
      50% { 
        transform: scale(1.6);
        opacity: 0.7;
      }
    }
  `;

  return (
    <>
      <style>{pulseKeyframes}</style>
      <div style={getTurnStyles()}>
        <div 
          style={{
            ...getIndicatorStyles(),
            animation: 'sophisticatedPulse 2s ease-in-out infinite',
          }}
        />
        <span style={{ 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          userSelect: 'none' as const,
        }}>
          {getStatusText()}
        </span>
      </div>
    </>
  );
} 