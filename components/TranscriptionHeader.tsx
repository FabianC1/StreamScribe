'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, ArrowLeft } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function TranscriptionHeader() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Mock authentication state
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Mock authentication check
    setIsAuthenticated(false)
  }, [])

  const handleSubscriptionsClick = () => {
    if (isAuthenticated) {
      router.push('/subscriptions')
    } else {
      setShowAuthModal(true)
    }
  }

  const handleBackClick = () => {
    router.push('/')
  }

  const handleLogout = () => {
    // Mock logout
    setIsAuthenticated(false)
    router.push('/')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 dark:bg-gray-900/85 backdrop-blur-md shadow-lg rounded-b-2xl'
          : 'bg-white dark:bg-gray-900 shadow-sm rounded-b-2xl'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" fill="white"/>
                  <path d="m10 15 5-3-5-3z" fill="#2563EB"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                StreamScribe
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {/* Subscriptions Button */}
            <button
              onClick={handleSubscriptionsClick}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Subscriptions
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Authentication Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <Shield className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Account Required
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You need to create an account to access your subscriptions and manage your plan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAuthModal(false)
                    router.push('/register')
                  }}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false)
                    router.push('/login')
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
