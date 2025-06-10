'use client'

import { useSession, signOut } from 'next-auth/react'

export default function UserProfile() {
  const { data: session } = useSession()

  if (!session?.user) return null

  return (
    <div className="flex items-center space-x-3">
      {session.user.image && (
        <img
          src={session.user.image}
          alt={session.user.name || 'User'}
          className="w-8 h-8 rounded-full"
        />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {session.user.name}
        </span>
        <span className="text-xs text-gray-500">
          {session.user.email}
        </span>
      </div>
      <button
        onClick={() => signOut()}
        className="text-xs text-red-600 hover:text-red-800"
      >
        Sign out
      </button>
    </div>
  )
} 