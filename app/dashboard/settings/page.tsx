'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut, Settings, User, Shield, CreditCard, Bell } from 'lucide-react'
import ThemeToggle from '../../../components/ThemeToggle'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200">
      <style jsx>{`
        .nav-link {
          @apply text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-200;
        }
      `}</style>
      
      {/* Header - Matching Main Page Design */}
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

            {/* Desktop Navigation - User Info & Sign Out */}
            <nav className={`hidden md:flex items-center gap-6 transition-all duration-200 ${
              isScrolled ? 'gap-5' : 'gap-6'
            }`}>
              {/* User Info */}
              <div className="flex items-center space-x-3">
                {session?.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || 'User'}
                    className="h-8 w-8 rounded-full border-2 border-gray-200 dark:border-gray-700"
                  />
                )}
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {session?.user?.name || 'User'}
                </span>
              </div>
              
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className={`nav-link text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 flex items-center gap-2 ${
                  isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
                }`}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>

              {/* Theme Toggle */}
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
                {/* User Info Mobile */}
                <div className="flex items-center space-x-3 py-3 px-4">
                  {session?.user?.image && (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || 'User'}
                      className="h-8 w-8 rounded-full border-2 border-gray-200 dark:border-gray-700"
                    />
                  )}
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {session?.user?.name || 'User'}
                  </span>
                </div>
                
                {/* Sign Out Mobile */}
                <button 
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Adjusted for Fixed Header */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your account preferences and settings</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Account Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Name</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Subscription</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Current Plan</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Basic Plan</p>
                </div>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-lg transition-colors duration-200"
                >
                  View Plans
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Status</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">Active</span>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Back to Dashboard */}
          <div className="text-center">
            <Link 
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
