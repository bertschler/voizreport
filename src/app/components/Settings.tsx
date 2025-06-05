'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { userNameAtom, setUserNameAtom, voiceModeAtom, setVoiceModeAtom, VOICE_MODE_OPTIONS, VoiceMode } from '../state/settingsState';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [userName] = useAtom(userNameAtom);
  const [, setUserName] = useAtom(setUserNameAtom);
  const [voiceMode] = useAtom(voiceModeAtom);
  const [, setVoiceMode] = useAtom(setVoiceModeAtom);

  const handleNameChange = (value: string) => {
    setUserName(value);
  };

  const handleVoiceModeChange = (mode: VoiceMode) => {
    setVoiceMode(mode);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1e293b',
          margin: '0 0 20px 0'
        }}>
          User Settings
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Your Name
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter your name"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: '#ffffff',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
          />
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '8px 0 0 0'
          }}>
            This name will be used in your reports and settings.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '12px'
          }}>
            Voice Chat Mode
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {VOICE_MODE_OPTIONS.map((option) => (
              <label
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  border: voiceMode === option.value ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: voiceMode === option.value ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleVoiceModeChange(option.value)}
              >
                <input
                  type="radio"
                  name="voiceMode"
                  value={option.value}
                  checked={voiceMode === option.value}
                  onChange={() => handleVoiceModeChange(option.value)}
                  style={{
                    marginTop: '2px',
                    accentColor: '#3b82f6'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    {option.label}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    lineHeight: '1.4'
                  }}>
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: '#f8fafc',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#64748b',
            margin: 0,
            fontStyle: 'italic'
          }}>
            More settings options will be added here soon...
          </p>
        </div>
      </div>
    </div>
  );
} 