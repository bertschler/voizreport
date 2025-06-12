'use client';

import React from 'react';

import { PhotoAttachment } from "@/app/types/core";

interface PhotoAttachmentViewerProps {
  photoAttachments: PhotoAttachment[];
  maxWidth?: number;
  showFilenames?: boolean;
}

export default function PhotoAttachmentViewer({ 
  photoAttachments, 
  maxWidth = 200,
  showFilenames = true 
}: PhotoAttachmentViewerProps) {
  if (!photoAttachments || photoAttachments.length === 0) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <h4 style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#334155',
        margin: '0 0 8px 0'
      }}>
        📸 Photo Attachments ({photoAttachments.length})
      </h4>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {photoAttachments.map((photo) => (
          <div key={photo.id} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '8px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            {/* Display the photo using base64 data URL - no cloud storage needed! */}
            <img 
              src={photo.dataUrl} 
              alt={photo.filename}
              style={{
                maxWidth: `${maxWidth}px`,
                height: 'auto',
                borderRadius: '6px',
                objectFit: 'cover'
              }}
            />
            
            {showFilenames && (
              <div style={{
                fontSize: '11px',
                color: '#64748b',
                textAlign: 'center',
                wordBreak: 'break-word'
              }}>
                <div style={{ fontWeight: '500' }}>{photo.filename}</div>
                <div>{(photo.size / 1024).toFixed(1)} KB</div>
                {photo.fieldName && (
                  <div style={{ 
                    color: '#8B5CF6',
                    fontWeight: '500',
                    marginTop: '2px'
                  }}>
                    📎 {photo.fieldName}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 