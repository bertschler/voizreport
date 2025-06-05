'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { voiceModeAtom, setVoiceModeAtom, currentVoiceModeOptionAtom } from '../../state/settingsState';

interface VoiceModeToggleProps {
  style?: React.CSSProperties;
}

export default function VoiceModeToggle({ style }: VoiceModeToggleProps) {
  const [voiceMode] = useAtom(voiceModeAtom);
  const [, setVoiceMode] = useAtom(setVoiceModeAtom);
  const [currentOption] = useAtom(currentVoiceModeOptionAtom);

  const toggleMode = () => {
    setVoiceMode(voiceMode === 'guided' ? 'freeform' : 'guided');
  };

  return (
    <button
      onClick={toggleMode}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        fontSize: '12px',
        color: '#64748b',
        cursor: 'pointer',
        transition: 'all 0.2s',
        outline: 'none',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f1f5f9';
        e.currentTarget.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#f8fafc';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
      title={`Current: ${currentOption.label}\nClick to switch modes`}
    >
      <span style={{ 
        fontSize: '10px',
        opacity: 0.7
      }}>
        {voiceMode === 'guided' ? '🎯' : '💬'}
      </span>
      <span style={{ fontSize: '11px' }}>
        {voiceMode === 'guided' ? 'Guided' : 'Freeform'}
      </span>
    </button>
  );
} 