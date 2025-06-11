import { useAtom } from 'jotai';
import { currentTurnAtom } from '@/app/state/voiceChatState';

/**
 * Hook to access the current turn state in the voice conversation
 * 
 * @returns Object with current turn state and utility functions
 */
export function useCurrentTurn() {
  const [currentTurn] = useAtom(currentTurnAtom);
  
  return {
    currentTurn,
    isUserTurn: currentTurn === 'user',
    isAssistantTurn: currentTurn === 'assistant', 
    isIdle: currentTurn === 'idle',
    isActive: currentTurn !== 'idle'
  };
} 