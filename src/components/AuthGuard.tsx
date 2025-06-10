'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AuthModal from './AuthModal'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, isLoading, showAuthModal, closeModal } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  // If auth is required but user is not authenticated, show the modal
  if (requireAuth && !isAuthenticated) {
    return (
      <>
        {children}
        <AuthModal isOpen={showAuthModal} onClose={closeModal} />
      </>
    )
  }

  // User is authenticated or auth is not required
  return <>{children}</>
} 