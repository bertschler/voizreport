'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { 
        callbackUrl: window.location.href,
        redirect: true 
      })
    } catch (error) {
      console.error('Sign in error:', error)
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  console.log('🚨 AuthModal rendering with isOpen:', isOpen)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '32px',
        maxWidth: '400px',
        width: 'calc(100% - 32px)',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Welcome!
          </h2>
          <p style={{ 
            color: '#6b7280', 
            marginBottom: '32px',
            margin: '0 0 32px 0'
          }}>
            Sign in to access your account and continue
          </p>
          
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#374151',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'background-color 0.2s',
              fontSize: '16px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
            }}
            onMouseLeave={(e) => {
              if (!isLoading) (e.target as HTMLButtonElement).style.backgroundColor = 'white'
            }}
          >
            {isLoading ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #d1d5db',
                borderTop: '2px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '12px'
              }}></div>
            ) : (
              <svg style={{ width: '20px', height: '20px', marginRight: '12px' }} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>
      </div>
    </div>
  )
} 