'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, ArrowLeft, History, Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function TranscriptionHeader() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Mock authentication state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

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

  const handleHistoryClick = () => {
    setShowHistoryModal(true)
  }

  const handleLogout = () => {
    // Mock logout
    setIsAuthenticated(false)
    router.push('/')
  }

  return (
    <>
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
              {/* History Button */}
              <button
                onClick={handleHistoryClick}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <History className="w-4 h-4" />
                History
              </button>

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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleHistoryClick}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <History className="w-5 h-5" />
                  History
                </button>
                
                <button
                  onClick={handleSubscriptionsClick}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  Subscriptions
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

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

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <History className="w-6 h-6 text-primary-600" />
                  Transcription History
                </h2>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Mock History Items */}
              <div className="space-y-4">
                {[
                  {
                    id: '1',
                    title: 'Introduction to Machine Learning',
                    url: 'https://www.youtube.com/watch?v=example1',
                    date: '2024-01-15',
                    duration: '15:30',
                    status: 'completed'
                  },
                  {
                    id: '2',
                    title: 'Deep Learning Fundamentals',
                    url: 'https://www.youtube.com/watch?v=example2',
                    date: '2024-01-14',
                    duration: '22:15',
                    status: 'completed'
                  },
                  {
                    id: '3',
                    title: 'Neural Networks Explained',
                    url: 'https://www.youtube.com/watch?v=example3',
                    date: '2024-01-13',
                    duration: '18:45',
                    status: 'completed'
                  },
                  {
                    id: '4',
                    title: 'AI Ethics and Responsibility',
                    url: 'https://www.youtube.com/watch?v=example4',
                    date: '2024-01-12',
                    duration: '25:20',
                    status: 'completed'
                  }
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 cursor-pointer hover:shadow-md"
                    onClick={() => {
                      setShowHistoryModal(false)
                      // Navigate to transcription results with the saved data
                      router.push(`/transcription-results?url=${encodeURIComponent(item.url)}&fromHistory=true`)
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" fill="currentColor"/>
                              <path d="m10 15 5-3-5-3z" fill="#2563EB"/>
                            </svg>
                            {item.duration}
                          </span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs rounded-full">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {false && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No transcription history yet</p>
                  <p className="text-sm">Your transcribed videos will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
