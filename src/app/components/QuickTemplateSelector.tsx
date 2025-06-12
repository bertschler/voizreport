'use client';

import React, { useEffect, useState } from 'react';
import { StoredTemplate } from '../state/templatesState';
import { ReportTemplate } from "@/app/types/core";

interface QuickTemplateSelectorProps {
  templates: StoredTemplate[];
  isVisible: boolean;
  onSelectTemplate: (template: ReportTemplate) => void;
  onCreateTemplate?: () => void;
  onClose: () => void;
}

export default function QuickTemplateSelector({ 
  templates, 
  isVisible, 
  onSelectTemplate, 
  onCreateTemplate,
  onClose 
}: QuickTemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <>
      {/* Optimized Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 1000,
          animation: 'fadeInBackdrop 0.3s ease-out'
        }}
      >
        {/* Simplified Floating Particles */}
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '20%',
          width: '6px',
          height: '6px',
          background: 'rgba(139, 92, 246, 0.6)',
          borderRadius: '50%',
          animation: 'floatSimple 8s ease-in-out infinite',
          willChange: 'transform'
        }} />
        <div style={{
          position: 'absolute',
          top: '70%',
          right: '25%',
          width: '4px',
          height: '4px',
          background: 'rgba(6, 182, 212, 0.5)',
          borderRadius: '50%',
          animation: 'floatSimple 6s ease-in-out infinite 2s',
          willChange: 'transform'
        }} />
      </div>

      {/* Optimized AI Interface */}
      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '430px',
        maxHeight: '85vh',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderBottom: 'none',
        padding: '32px 24px 48px 24px',
        boxShadow: '0 -15px 40px rgba(0, 0, 0, 0.15)',
        zIndex: 1001,
        animation: 'slideUpGlass 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'auto',
        willChange: 'transform'
      }}>
        {/* Lightweight gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '80px',
          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.03) 0%, transparent 100%)',
          pointerEvents: 'none'
        }} />

        {/* Handle Bar */}
        <div style={{
          width: '50px',
          height: '4px',
          background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)',
          borderRadius: '2px',
          margin: '0 auto 32px auto',
          opacity: 0.7
        }} />

        {/* AI Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#10B981',
              borderRadius: '50%',
              animation: 'pulseSimple 3s ease-in-out infinite',
              willChange: 'opacity'
            }} />
            <h2 style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#1e293b',
              margin: '0',
              letterSpacing: '-0.025em'
            }}>
              CREATE
            </h2>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#F59E0B',
              borderRadius: '50%',
              animation: 'pulseSimple 3s ease-in-out infinite 1.5s',
              willChange: 'opacity'
            }} />
          </div>
          <p style={{
            fontSize: '14px',
            color: 'rgba(30, 41, 59, 0.7)',
            margin: '0',
            fontWeight: '500'
          }}>
            Choose a report template and start speaking
          </p>
        </div>

        {/* Optimized Templates Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {/* Create New Template Button */}
          {onCreateTemplate && (
            <button
              onClick={onCreateTemplate}
              onMouseEnter={() => setHoveredTemplate(-1)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className={`template-button ${hoveredTemplate === -1 ? 'hovered' : ''}`}
              style={{
                background: hoveredTemplate === -1 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)'
                  : 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: hoveredTemplate === -1 
                  ? '2px solid rgba(16, 185, 129, 0.3)'
                  : '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                padding: '24px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                minHeight: '120px',
                position: 'relative',
                overflow: 'hidden',
                willChange: 'transform',
                animation: 'templateSlideIn 0.4s ease-out 0s both'
              }}
            >
              {/* Plus Icon with subtle animation */}
              <div style={{
                fontSize: '36px',
                marginBottom: '12px',
                lineHeight: '1',
                transition: 'transform 0.2s ease',
                transform: hoveredTemplate === -1 ? 'scale(1.1) rotate(180deg)' : 'scale(1)',
                color: hoveredTemplate === -1 ? '#10B981' : '#64748b'
              }}>
                ✨
              </div>
              
              {/* Title */}
              <h3 style={{
                fontSize: '15px',
                fontWeight: '700',
                color: hoveredTemplate === -1 ? '#10B981' : '#475569',
                margin: '0',
                lineHeight: '1.3',
                transition: 'color 0.2s ease',
                letterSpacing: '-0.01em'
              }}>
                Create New
              </h3>
            </button>
          )}
          
          {templates.map((template, index) => (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className={`template-button ${hoveredTemplate === template.id ? 'hovered' : ''}`}
              style={{
                background: hoveredTemplate === template.id 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)'
                  : 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: hoveredTemplate === template.id 
                  ? '2px solid rgba(139, 92, 246, 0.2)'
                  : '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                padding: '24px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                minHeight: '120px',
                position: 'relative',
                overflow: 'hidden',
                willChange: 'transform',
                animation: `templateSlideIn 0.4s ease-out ${(index + 1) * 0.08}s both`
              }}
            >
              {/* Icon */}
              <div style={{
                fontSize: '36px',
                marginBottom: '12px',
                lineHeight: '1',
                transition: 'transform 0.2s ease',
                transform: hoveredTemplate === template.id ? 'scale(1.1)' : 'scale(1)'
              }}>
                {template.icon}
              </div>
              
              {/* Title */}
              <h3 style={{
                fontSize: '15px',
                fontWeight: '700',
                color: hoveredTemplate === template.id ? '#1e293b' : '#475569',
                margin: '0',
                lineHeight: '1.3',
                transition: 'color 0.2s ease',
                letterSpacing: '-0.01em'
              }}>
                {template.title}
              </h3>
            </button>
          ))}
        </div>

        {/* Optimized Cancel Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            color: '#64748b',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Cancel
        </button>
      </div>

      {/* Optimized CSS Animations */}
      <style jsx>{`
        .template-button:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 24px rgba(139, 92, 246, 0.1);
        }

        /* Auto-hide scrollbar - only show when scrolling/hovering */
        div::-webkit-scrollbar {
          width: 6px;
        }
        
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        
        div::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0);
          border-radius: 3px;
          transition: background 0.3s ease;
        }
        
        div:hover::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }

        /* For Firefox */
        div {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s ease;
        }
        
        div:hover {
          scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
        }

        @keyframes fadeInBackdrop {
          from { 
            opacity: 0;
          }
          to { 
            opacity: 1;
          }
        }
        
        @keyframes slideUpGlass {
          from { 
            transform: translateX(-50%) translateY(100%);
            opacity: 0;
          }
          to { 
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        @keyframes templateSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatSimple {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-15px); 
          }
        }

        @keyframes pulseSimple {
          0%, 100% { 
            opacity: 1; 
          }
          50% { 
            opacity: 0.5; 
          }
        }
      `}</style>
    </>
  );
} 