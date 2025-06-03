'use client';

import React, { useState, useEffect } from 'react';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [userName, setUserName] = useState<string>('');

  // Load saved name from localStorage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem('voizreport_username');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  // Save name to localStorage whenever it changes
  const handleNameChange = (value: string) => {
    setUserName(value);
    localStorage.setItem('voizreport_username', value);
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