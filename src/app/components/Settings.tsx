'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { userNameAtom, setUserNameAtom, voiceModeAtom, setVoiceModeAtom, VOICE_MODE_OPTIONS, VoiceMode } from '../state/settingsState';
import { selectedVoiceAtom, VOICE_OPTIONS, VoiceOption } from '../state/voiceChatState';

export default function Settings() {
  const [userName] = useAtom(userNameAtom);
  const [, setUserName] = useAtom(setUserNameAtom);
  const [voiceMode] = useAtom(voiceModeAtom);
  const [, setVoiceMode] = useAtom(setVoiceModeAtom);
  const [selectedVoice, setSelectedVoice] = useAtom(selectedVoiceAtom);
  const [playingVoice, setPlayingVoice] = React.useState<VoiceOption | null>(null);
  const [loadingVoice, setLoadingVoice] = React.useState<VoiceOption | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleNameChange = (value: string) => {
    setUserName(value);
  };

  const handleVoiceModeChange = (mode: VoiceMode) => {
    setVoiceMode(mode);
  };

  const handleVoiceChange = (voice: VoiceOption) => {
    setSelectedVoice(voice);
  };

  const playVoicePreview = async (voice: VoiceOption) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setLoadingVoice(voice);
    setPlayingVoice(null);

    try {
      const response = await fetch('/api/voice-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voice: voice,
          text: 'Hello! I\'m ready to help you create a report. How can I assist you today?'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate voice preview');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => {
        setPlayingVoice(voice);
        setLoadingVoice(null);
      };
      
      audio.onended = () => {
        setPlayingVoice(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        setPlayingVoice(null);
        setLoadingVoice(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        console.error('Error playing voice preview');
      };

      await audio.play();
    } catch (error) {
      console.error('Voice preview error:', error);
      setLoadingVoice(null);
      setPlayingVoice(null);
    }
  };

  // Cleanup audio on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '12px'
          }}>
            AI Voice
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {VOICE_OPTIONS.map((option) => (
              <div
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px',
                  border: selectedVoice === option.value ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: selectedVoice === option.value ? '#eff6ff' : '#ffffff',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="voiceSelection"
                  value={option.value}
                  checked={selectedVoice === option.value}
                  onChange={() => handleVoiceChange(option.value)}
                  style={{
                    marginTop: '2px',
                    accentColor: '#3b82f6'
                  }}
                />
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleVoiceChange(option.value)}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '2px'
                  }}>
                    {option.label}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    lineHeight: '1.3'
                  }}>
                    {option.description}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playVoicePreview(option.value);
                  }}
                  disabled={loadingVoice === option.value || playingVoice === option.value}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: playingVoice === option.value ? '#ef4444' : '#3b82f6',
                    backgroundColor: 'transparent',
                    border: `1px solid ${playingVoice === option.value ? '#ef4444' : '#3b82f6'}`,
                    borderRadius: '4px',
                    cursor: loadingVoice === option.value ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '70px',
                    opacity: loadingVoice === option.value ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (loadingVoice !== option.value && playingVoice !== option.value) {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (loadingVoice !== option.value && playingVoice !== option.value) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#3b82f6';
                    }
                  }}
                >
                  {loadingVoice === option.value ? '...' : 
                   playingVoice === option.value ? '🔊' : '▶️'}
                </button>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '8px 0 0 0',
            fontStyle: 'italic'
          }}>
            Click ▶️ to preview each voice. Voice selection applies to new conversations only.
          </p>
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