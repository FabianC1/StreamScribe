'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
    }
  }
}

interface User {
  id: string
  email: string
  name: string
  image?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (provider?: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }

    if (session?.user) {
      setUser({
        id: session.user.id as string,
        email: session.user.email as string,
        name: session.user.name as string,
        image: session.user.image as string,
      })
    } else {
      setUser(null)
    }

    setLoading(false)
  }, [session, status])

  const handleSignIn = async (provider?: string) => {
    try {
      await signIn(provider)
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
