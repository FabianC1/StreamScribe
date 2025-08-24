'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Youtube, User, LogOut, Shield } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false) // TODO: Replace with actual auth state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleSubscriptionsClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      setShowAuthModal(true)
    }
  }

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    setIsAuthenticated(false)
    window.location.href = '/'
  }

  const handleAnchorClick = (section: string) => {
    // If we're not on the main page, navigate there first
    if (pathname !== '/') {
      router.push(`/#${section}`)
    } else {
      // If we're already on the main page, just scroll to the section
      const element = document.getElementById(section)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/85 dark:bg-gray-900/85 backdrop-blur-md shadow-lg rounded-b-2xl' 
          : 'bg-white dark:bg-gray-900 shadow-sm rounded-b-2xl'
      } border-b border-gray-100 dark:border-gray-800`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className={`flex items-center gap-2 transition-all duration-200 ${
              isScrolled ? 'scale-95' : 'scale-100'
            }`}>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" fill="white"/>
                    <path d="m10 15 5-3-5-3z" fill="#2563EB"/>
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">StreamScribe</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className={`hidden md:flex items-center gap-6 transition-all duration-200 ${
              isScrolled ? 'gap-5' : 'gap-6'
            }`}>
              <button 
                onClick={() => handleAnchorClick('features')}
                className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-200 ${
                  isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
                }`}
              >
                Features
              </button>
              <button 
                onClick={() => handleAnchorClick('pricing')}
                className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-200 ${
                  isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
                }`}
              >
                Pricing
              </button>
               
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/subscriptions" 
                    className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-200 ${
                      isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
                    }`}
                  >
                    Subscriptions
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`nav-link text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 flex items-center gap-2 ${
                      isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSubscriptionsClick}
                    className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-200 flex items-center gap-2 ${
                      isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Subscriptions
                  </button>
                  <Link 
                    href="/register" 
                    className={`btn-primary transition-all duration-200 ${
                      isScrolled ? 'scale-95 shadow-md' : 'scale-100'
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              )}

              <div className={`transition-all duration-200 ${
                isScrolled ? 'scale-95' : 'scale-100'
              }`}>
                <ThemeToggle />
              </div>
            </nav>

            {/* Mobile Menu Button and Theme Toggle */}
            <div className="md:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 mobile-menu-container"
                aria-label="Toggle mobile menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 mobile-menu-container">
              <nav className="py-4 px-4 space-y-3">
                <button 
                  onClick={() => {
                    handleAnchorClick('features')
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500"
                >
                  Features
                </button>
                <button 
                  onClick={() => {
                    handleAnchorClick('pricing')
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500"
                >
                  Pricing
                </button>
                 
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/subscriptions" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      Subscriptions
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSubscriptionsClick}
                      className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      <Shield className="w-4 h-4" />
                      Subscriptions
                    </button>
                    <Link 
                      href="/register" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center py-3 px-4 btn-primary transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Authentication Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full transform transition-all duration-300 scale-100 opacity-100 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Account Required
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                You need to create an account to access subscription management and view your usage.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link 
                href="/register" 
                className="btn-primary w-full flex items-center justify-center gap-2"
                onClick={() => setShowAuthModal(false)}
              >
                Create Account
              </Link>
              <Link 
                href="/login" 
                className="btn-secondary w-full flex items-center justify-center gap-2"
                onClick={() => setShowAuthModal(false)}
              >
                Sign In
              </Link>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}