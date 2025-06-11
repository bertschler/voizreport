'use client';

import React from 'react';
import { useCurrentTurn } from '@/app/hooks/useCurrentTurn';

/**
 * Example component showing how to use turn tracking
 * Displays whose turn it is in the conversation
 */
export function TurnIndicator() {
  const { currentTurn, isUserTurn, isAssistantTurn, isIdle, isActive } = useCurrentTurn();

  const getTurnColor = () => {
    switch (currentTurn) {
      case 'user':
        return 'text-blue-600 bg-blue-50';
      case 'assistant':
        return 'text-green-600 bg-green-50';
      case 'idle':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTurnIcon = () => {
    switch (currentTurn) {
      case 'user':
        return '🎤';
      case 'assistant':
        return '🤖';
      case 'idle':
        return '⏸️';
      default:
        return '❓';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getTurnColor()}`}>
      <span className="text-lg">{getTurnIcon()}</span>
      <span>
        {isUserTurn && 'User Speaking'}
        {isAssistantTurn && 'AI Responding'}
        {isIdle && 'Idle'}
      </span>
      {isActive && (
        <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
      )}
    </div>
  );
} 