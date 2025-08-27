'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Youtube, Clock, Play, Download, History, TrendingUp, Zap, Star, Crown, Shield } from 'lucide-react'

interface Transcription {
  _id: string
  videoTitle: string
  youtubeUrl: string
  audioDuration: number
  createdAt: string
  confidence: number
  status: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { user: customUser } = useAuth()
  const router = useRouter()
  const [recentTranscriptions, setRecentTranscriptions] = useState<Transcription[]>([])
  const [usageData, setUsageData] = useState({ hoursUsed: 0, totalTranscriptions: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [showDuplicateMessage, setShowDuplicateMessage] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; transcriptionId: string; videoTitle: string } | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  const isAuthenticated = status === 'authenticated' || !!customUser
  const isLoadingAuth = status === 'loading'

  // Show auth modal if user is not authenticated
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      setShowAuthModal(true)
    }
  }, [isAuthenticated, isLoadingAuth])

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentTranscriptions()
      fetchUsageData()
      
      // Check if user was redirected from duplicate URL attempt
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('duplicate') === 'true') {
        setShowDuplicateMessage(true)
        // Remove the parameter from URL
        window.history.replaceState({}, document.title, '/dashboard')
      }
    }
  }, [isAuthenticated])

  const fetchRecentTranscriptions = async () => {
    try {
      const response = await fetch('/api/dashboard/transcriptions?limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentTranscriptions(data.transcriptions || [])
      } else {
        console.error('❌ API response not ok:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch recent transcriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

    const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/usage/stats')
      if (response.ok) {
        const data = await response.json()
                 setUsageData({
          hoursUsed: data.monthlyHours || 0,
          totalTranscriptions: data.totalTranscriptions || 0
        })
        console.log('✅ Usage data fetched:', data)
      } else {
        console.error('❌ Usage API response not ok:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
    }
  }

  const handleDeleteTranscription = async (transcriptionId: string) => {
    try {
      const response = await fetch(`/api/transcriptions/${transcriptionId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove from local state
        setRecentTranscriptions(prev => prev.filter(t => t._id !== transcriptionId))
        // Refresh usage data since total count changed
        fetchUsageData()
        setDeleteConfirmation(null)
      } else {
        console.error('Failed to delete transcription')
      }
    } catch (error) {
      console.error('Error deleting transcription:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  if (isLoadingAuth) {
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
        {isAuthenticated ? (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {session?.user?.name?.split(' ')[0] || customUser?.firstName || 'User'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Here's what's happening with your transcriptions
              </p>
              
              {/* Duplicate URL Message */}
              {showDuplicateMessage && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">ℹ️</span>
                    </div>
                    <div>
                      <p className="text-blue-800 dark:text-blue-200 font-medium">
                        Video Already Transcribed
                      </p>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        You've already transcribed this video. Check your recent transcriptions below or start with a new one.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDuplicateMessage(false)}
                      className="ml-auto text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transcriptions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{usageData.totalTranscriptions}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Youtube className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 group hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200">
                      <span className="group-hover:hidden">This Month</span>
                      <span className="hidden group-hover:inline">Minutes</span>
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200">
                      <span className="group-hover:hidden">{usageData.hoursUsed.toFixed(2)}h</span>
                      <span className="hidden group-hover:inline">{Math.round(usageData.hoursUsed * 60)}m</span>
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/30 transition-colors duration-200">
                    <Clock className="h-6 w-6 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200" />
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
                    {customUser?.subscriptionTier === 'premium' ? (
                      <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    ) : customUser?.subscriptionTier === 'standard' ? (
                      <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transcriptions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Transcriptions</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Your latest video transcriptions</p>
                  </div>
                  
                  {/* New Transcription Button */}
                  <button
                    onClick={() => router.push('/transcribe')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Transcription
                  </button>
                </div>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading transcriptions...</p>
                  </div>
                ) : recentTranscriptions.length > 0 ? (
                  <div className="space-y-4">
                    {recentTranscriptions.slice(0, 5).map((transcription) => (
                      <div key={transcription._id} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`h-16 w-16 rounded-lg flex items-center justify-center ${
                            transcription.status === 'failed' 
                              ? 'bg-red-100 dark:bg-red-900/20' 
                              : 'bg-blue-100 dark:bg-blue-900/20'
                          }`}>
                            <Youtube className={`h-8 w-8 ${
                              transcription.status === 'failed'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {transcription.videoTitle}
                            </h3>
                            <div className="flex items-center space-x-6 text-base text-gray-500 dark:text-gray-400">
                              <span className="flex items-center space-x-2">
                                <Clock className="h-5 w-5" />
                                <span>{formatDuration(transcription.audioDuration)}</span>
                              </span>
                              {(transcription.status === 'completed' || !transcription.status) && (
                                <span className="flex items-center space-x-2">
                                  <Play className="h-5 w-5" />
                                  <span>{transcription.confidence && !isNaN(transcription.confidence) ? Math.round(transcription.confidence * 100) : 0}% confidence</span>
                                </span>
                              )}
                              <span className={`${
                                transcription.status === 'failed' ? 'text-red-600 dark:text-red-400' : ''
                              }`}>
                                {transcription.status === 'failed' ? 'Failed' : `Transcribed ${formatDate(transcription.createdAt)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                       
                        <div className="flex gap-2">
                          {(transcription.status === 'failed') ? (
                            <button
                              onClick={() => router.push(`/transcribe?retry=${encodeURIComponent(transcription.youtubeUrl)}`)}
                              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-300 relative group border-2 border-transparent hover:border-red-400"
                            >
                              <span className="relative z-10">Retry</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => router.push(`/transcription-results?url=${encodeURIComponent(transcription.youtubeUrl)}`)}
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 text-center relative group border-2 border-transparent hover:border-blue-400"
                            >
                              <span className="relative z-10">Edit</span>
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirmation({ 
                              show: true, 
                              transcriptionId: transcription._id, 
                              videoTitle: transcription.videoTitle 
                            })}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-300 relative group border-2 border-transparent hover:border-red-400"
                          >
                            <span className="relative z-10">Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {recentTranscriptions.length > 0 && (
                      <div className="text-center pt-4">
                        <button
                          onClick={() => router.push('/dashboard/history')}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                          View all transcriptions →
                        </button>
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
                    <button
                      onClick={() => router.push('/transcribe')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Start Transcribing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>

       {/* Delete Confirmation Modal */}
       {deleteConfirmation && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               Delete Transcription
             </h3>
             <p className="text-gray-600 dark:text-gray-300 mb-6">
               Are you sure you want to remove "{deleteConfirmation.videoTitle}"? This action cannot be undone.
             </p>
             <div className="flex gap-3">
               <button
                 onClick={() => setDeleteConfirmation(null)}
                 className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
               >
                 No, Cancel
               </button>
               <button
                 onClick={() => handleDeleteTranscription(deleteConfirmation.transcriptionId)}
                 className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
               >
                 Yes, Delete
               </button>
             </div>
           </div>
         </div>
               )}

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
                  You need to create an account to access your dashboard, settings, and manage your subscription.
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/register')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Create Account
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:text-gray-300 font-medium rounded-lg transition-colors duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
