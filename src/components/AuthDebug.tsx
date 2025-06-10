'use client'

import { useAuth } from '@/hooks/useAuth'

export default function AuthDebug() {
  const { session, user, status, isAuthenticated, isLoading, showAuthModal } = useAuth()

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div>Status: {status}</div>
      <div>Session: {session ? 'YES' : 'NO'}</div>
      <div>Authenticated: {isAuthenticated ? 'YES' : 'NO'}</div>
      <div>Loading: {isLoading ? 'YES' : 'NO'}</div>
      <div>Show Modal: {showAuthModal ? 'YES' : 'NO'}</div>
      <div>User: {user?.name || 'none'}</div>
    </div>
  )
} 