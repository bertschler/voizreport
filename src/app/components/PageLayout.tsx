'use client';

import React, { useState, useEffect } from 'react';

import { ReportTemplate } from "@/app/types/core";

interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentPadding?: string;
  onNavigateToSession?: (template: ReportTemplate) => void;
}

// Hook to detect mobile devices and screen size
function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileUA || isSmallScreen);
    };

    // Check on mount
    checkMobile();

    // Check on resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
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

// Bottom component that acts as padding for mobile browser address bar space
function MobileSafeAreaBottom() {
  const isMobile = useMobileDetection();

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <div 
      style={{
        height: '80px',
        minHeight: '60px',
        backgroundColor: '#f8fafc', // Subtle background that matches app
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        flexShrink: 0
      }}
    >
      {/* Optional: Voice sine wave visualization */}
      <VoiceSineWave />
    </div>
  );
}

// Optional visual element - voice sine wave
function VoiceSineWave() {
  return (
    <div style={{ opacity: 0.3, width: '100%', height: '100%', position: 'relative' }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 400 60" 
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Animated sine wave path */}
        <path
          d="M0,30 Q100,10 200,30 T400,30"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        >
          <animate
            attributeName="d"
            values="M0,30 Q100,10 200,30 T400,30;M0,30 Q100,50 200,30 T400,30;M0,30 Q100,10 200,30 T400,30"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
        
        {/* Secondary wave */}
        <path
          d="M0,30 Q50,20 100,30 Q150,40 200,30 Q250,20 300,30 Q350,40 400,30"
          stroke="url(#waveGradient)"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        >
          <animate
            attributeName="d"
            values="M0,30 Q50,20 100,30 Q150,40 200,30 Q250,20 300,30 Q350,40 400,30;M0,30 Q50,40 100,30 Q150,20 200,30 Q250,40 300,30 Q350,20 400,30;M0,30 Q50,20 100,30 Q150,40 200,30 Q250,20 300,30 Q350,40 400,30"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
} 