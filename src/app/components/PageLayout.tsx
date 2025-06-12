'use client';

import React from 'react';

import { ReportTemplate } from "@/app/types/core";
import { MobileSafeAreaBottom } from './MobileSafeAreaBottom';

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
      height: 'var(--vh-dynamic)', // Use CSS custom property for dynamic viewport height
      minHeight: 'var(--vh-static)', // Fallback for browsers that don't support dvh
      backgroundColor: '#f8fafc',
      maxWidth: '430px',
      margin: '0 auto',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
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
      
      {/* Mobile Browser Address Bar Safe Area - Bottom Padding Component */}
      <MobileSafeAreaBottom />
    </div>
  );
}
