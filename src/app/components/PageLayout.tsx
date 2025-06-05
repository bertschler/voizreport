'use client';

import React from 'react';
import FloatingSessionIndicator from './FloatingSessionIndicator';
import { ReportTemplate } from '../data/mockData';

interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentPadding?: string;
  onNavigateToSession?: (template: ReportTemplate) => void;
}

export default function PageLayout({ 
  children, 
  header, 
  footer, 
  contentPadding = '20px',
  onNavigateToSession 
}: PageLayoutProps) {
  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#f8fafc',
      maxWidth: '430px',
      margin: '0 auto',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Section */}
      {header}

      {/* Main Content - Scrollable */}
      <div style={{ 
        padding: contentPadding,
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {children}
      </div>

      {/* Footer Section */}
      {footer}

      {/* Floating Session Indicator - shows when there's an active session */}
      {onNavigateToSession && (
        <FloatingSessionIndicator onNavigateToSession={onNavigateToSession} />
      )}
    </div>
  );
} 