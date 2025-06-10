'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Show modal if user is not authenticated and status is not loading
  useEffect(() => {
    if (status === 'unauthenticated') {
      setShowAuthModal(true)
    } else if (status === 'authenticated') {
      setShowAuthModal(false)
    }
  }, [status])

  const closeModal = () => {
    setShowAuthModal(false)
  }

  const openModal = () => {
    setShowAuthModal(true)
  }

  return {
    session,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    showAuthModal,
    closeModal,
    openModal,
  }
} 