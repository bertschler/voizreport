'use client';

import React from 'react';
import { useAtomValue } from 'jotai';
import { photoAttachmentsAtom } from '../../state/voiceChatState';

export default function LivePhotoViewer() {
  const photos = useAtomValue(photoAttachmentsAtom);

  if (photos.length === 0) {
    return null;
  }

  return (
    <div style={{
      marginBottom: '24px',
      padding: '16px',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <span style={{ fontSize: '16px' }}>📸</span>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#334155',
          margin: 0
        }}>
          Captured Photos ({photos.length})
        </h4>
      </div>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {photos.map((photo) => (
          <div key={photo.id} style={{
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid #e2e8f0'
          }}>
            <img 
              src={photo.dataUrl} 
              alt={photo.filename}
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            
            {/* Field association indicator */}
            {photo.fieldName && (
              <div style={{
                position: 'absolute',
                bottom: '2px',
                left: '2px',
                right: '2px',
                backgroundColor: 'rgba(139, 92, 246, 0.9)',
                color: 'white',
                fontSize: '9px',
                fontWeight: '600',
                textAlign: 'center',
                padding: '2px',
                borderRadius: '4px'
              }}>
                {photo.fieldName}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <p style={{
        fontSize: '12px',
        color: '#64748b',
        margin: '8px 0 0 0',
        textAlign: 'center'
      }}>
        Photos will be attached to your report when submitted
      </p>
    </div>
  );
} 