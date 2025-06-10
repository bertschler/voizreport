'use client'

import { signOut } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'

export default function UserProfile() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {user.image && (
        <img
          src={user.image}
          alt={user.name || 'User'}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%'
          }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#111827'
        }}>
          {user.name}
        </span>
        <span style={{
          fontSize: '12px',
          color: '#6b7280'
        }}>
          {user.email}
        </span>
      </div>
      <button
        onClick={() => signOut()}
        style={{
          fontSize: '12px',
          color: '#dc2626',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px'
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.color = '#991b1b'
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.color = '#dc2626'
        }}
      >
        Sign out
      </button>
    </div>
  )
} 