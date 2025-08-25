'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Youtube, User, LogOut, Shield } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  
  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'

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
    signOut({ callbackUrl: '/' })
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
              <Link 
                href="/"
                className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-200 relative ${
                  isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
                }`}
              >
                About
                {pathname === '/' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 via-secondary-500 to-primary-600 animate-gradient-border"></div>
                )}
              </Link>
              <Link 
                href="/pricing"
                className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-200 relative ${
                  isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
                }`}
              >
                Pricing
                {pathname === '/pricing' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 via-secondary-500 to-primary-600 animate-gradient-border"></div>
                )}
              </Link>
               
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-200 relative ${
                      isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
                    }`}
                  >
                    Dashboard
                    {pathname === '/dashboard' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 via-secondary-500 to-primary-600 animate-gradient-border"></div>
                    )}
                  </Link>
                  <Link 
                    href="/settings" 
                    className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-200 relative ${
                      isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
                    }`}
                  >
                    Settings
                    {pathname === '/settings' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 via-secondary-500 to-primary-600 animate-gradient-border"></div>
                    )}
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {session?.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt={session.user.name || 'User'} 
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {session?.user?.name || 'User'}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className={`nav-link text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 flex items-center gap-2 ${
                        isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
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
                    Dashboard
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
                <Link 
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 relative ${
                    pathname === '/' ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  About
                  {pathname === '/' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 via-secondary-500 to-primary-600 animate-gradient-border"></div>
                  )}
                </Link>
                <Link 
                  href="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 relative ${
                    pathname === '/pricing' ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  Pricing
                  {pathname === '/pricing' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 via-secondary-500 to-primary-600 animate-gradient-border"></div>
                  )}
                </Link>
                 
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 mb-3">
                      <div className="flex items-center gap-3">
                        {session?.user?.image ? (
                          <img 
                            src={session.user.image} 
                            alt={session.user.name || 'User'} 
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {session?.user?.name || 'User'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {session?.user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsMenuOpen(false)}
                      className={`block w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 relative ${
                        pathname === '/dashboard' ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      Dashboard
                      {pathname === '/dashboard' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 via-secondary-500 to-primary-600 animate-gradient-border"></div>
                      )}
                    </Link>
                    <Link 
                      href="/settings" 
                      onClick={() => setIsMenuOpen(false)}
                      className={`block w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 relative ${
                        pathname === '/settings' ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      Settings
                      {pathname === '/settings' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 via-secondary-500 to-primary-600 animate-gradient-border"></div>
                      )}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSubscriptionsClick}
                      className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      <Shield className="w-4 h-4" />
                      Dashboard
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
                You need to create an account to access your dashboard and manage your subscription.
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