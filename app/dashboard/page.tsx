'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Youtube, Clock, FileText } from 'lucide-react'
import Header from '../../components/Header'
import { useAuth } from '../contexts/AuthContext'

interface Transcription {
  _id: string
  videoTitle: string
  youtubeUrl: string
  audioDuration: number
  cachedAt: string
  highlights: string[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { user: customUser, logout: customLogout, isLoading: customLoading } = useAuth()
  const router = useRouter()
  const [recentTranscriptions, setRecentTranscriptions] = useState<Transcription[]>([])
  const [loading, setLoading] = useState(true)

  // Determine which user is authenticated
  const isAuthenticated = status === 'authenticated' || !!customUser
  const currentUser = session?.user || customUser
  const isLoading = status === 'loading' || customLoading

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchRecentTranscriptions()
    }
  }, [isAuthenticated, currentUser])

  const fetchRecentTranscriptions = async () => {
    try {
      // Use the appropriate user ID based on authentication method
      const userId = session?.user?.id || customUser?._id
      if (!userId) return

      // Prepare headers based on authentication method
      const headers: HeadersInit = {}
      if (customUser && !session) {
        // Custom auth user - send authorization header
        headers['Authorization'] = `Bearer ${userId}`
      }

      const response = await fetch('/api/dashboard/transcriptions', {
        headers
      })
      if (response.ok) {
        const data = await response.json()
        setRecentTranscriptions(data.transcriptions || [])
      }
    } catch (error) {
      console.error('Error fetching transcriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Remove unused handleSignOut function since Header handles logout
  // const handleSignOut = () => {
  //   if (session) {
  //     // NextAuth user
  //     signOut({ callbackUrl: '/' })
  //   } else {
  //     // Custom auth user
  //     customLogout()
  //   }
  // }

  // Remove unused userInfo and getUserDisplayInfo function
  // const userInfo = getUserDisplayInfo()
  // const getUserDisplayInfo = () => {
  //   if (session?.user) {
  //     return {
  //       name: session.user.name || 'User',
  //       image: session.user.image,
  //       email: session.user.email || ''
  //     }
  //   } else if (customUser) {
  //     return {
  //       name: `${customUser.firstName} ${customUser.lastName}`,
  //       image: customUser.avatar || null,
  //       email: customUser.email
  //     }
  //   } else {
  //     return {
  //       name: 'User',
  //       image: null,
  //       email: ''
  //     }
  //   }
  // }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
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
      <Header />

      {/* Main Content - Adjusted for Fixed Header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0] || customUser?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here's what's happening with your transcriptions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transcriptions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentTranscriptions.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hours Used</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {customUser ? customUser.hoursUsed : 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscription</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {customUser ? customUser.subscriptionTier : 'Basic'}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                {/* Shield icon removed as per new_code */}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transcriptions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Transcriptions</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Your latest video transcriptions</p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading transcriptions...</p>
              </div>
            ) : recentTranscriptions.length > 0 ? (
              <div className="space-y-4">
                {recentTranscriptions.slice(0, 5).map((transcription) => (
                  <div key={transcription._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Youtube className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {transcription.videoTitle}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(transcription.audioDuration)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{transcription.highlights.length} highlights</span>
                          </span>
                          <span>Transcribed {formatDate(transcription.cachedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/transcription-results?id=${transcription._id}`}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
                {recentTranscriptions.length > 5 && (
                  <div className="text-center pt-4">
                    <Link
                      href="/dashboard/history"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      View all transcriptions →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Youtube className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No transcriptions yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Get started by transcribing your first YouTube video
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Start Transcribing
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
