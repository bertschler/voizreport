'use client';

import React from 'react';
import { WebRTCService } from '../services/webrtcService';

export default function CameraButton() {
  const handleCameraClick = () => {
    // Send a message to the AI to trigger camera opening
    WebRTCService.getInstance().sendConversationMessage(
      'I want to take a photo. Please open the camera interface.'
    );
  };

  return (
    <button
      onClick={handleCameraClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 16px',
        backgroundColor: '#8B5CF6',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
        minWidth: '120px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#7C3AED';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#8B5CF6';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.2)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
      }}
    >
      <span style={{ fontSize: '16px' }}>📸</span>
      <span>Add Photo</span>
    </button>
  );
} 