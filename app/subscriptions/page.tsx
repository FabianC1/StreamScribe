'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import { CreditCard, Calendar, Clock, AlertTriangle, Settings, User, LogOut, Shield, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface UserData {
  firstName: string
  lastName: string
  email: string
  subscriptionTier: string
  subscriptionStatus: string
  subscriptionStartDate: string
  subscriptionEndDate: string
  hoursUsed: number
  hoursLimit: number
}

export default function SubscriptionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [recentTranscriptions, setRecentTranscriptions] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (session?.user?.id) {
      fetchUserData()
      fetchRecentTranscriptions()
    }
  }, [session, status, router])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/subscription')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchRecentTranscriptions = async () => {
    try {
      const response = await fetch('/api/dashboard/transcriptions')
      if (response.ok) {
        const data = await response.json()
        setRecentTranscriptions(data.transcriptions || [])
      }
    } catch (error) {
      console.error('Error fetching transcriptions:', error)
    }
  }

  const handleCancelSubscription = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setShowCancelModal(false)
    // In real app, update subscription status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getPlanPrice = (tier: string) => {
    switch (tier) {
      case 'basic': return '6.99'
      case 'standard': return '12.99'
      case 'premium': return '19.99'
      default: return '0.00'
    }
  }

  // Show loading state
  if (status === 'loading' || isLoadingData) {
    return (
      <>
        <Header />
        <main className="pt-28 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
            <p className="text-gray-600 dark:text-gray-300">Loading subscription details...</p>
          </div>
        </main>
      </>
    )
  }

  // Show authentication required message if not authenticated
  if (status === 'unauthenticated') {
    return (
      <>
        <Header />
        <main className="pt-28 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-8">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authentication Required
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Please sign in to view your subscription details and manage your account.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link href="/login" className="btn-primary w-full">
                Sign In
              </Link>
              <Link href="/register" className="btn-secondary w-full">
                Create Account
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="pt-28 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Subscription Management
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage your StreamScribe subscription and usage
            </p>
          </div>

          {/* User Info */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {userData?.email || 'Loading...'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="btn-secondary flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Subscription Status Card */}
          <div className="max-w-4xl mx-auto">
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Current Subscription
                </h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userData?.subscriptionStatus === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {userData?.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Plan Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {userData?.subscriptionTier ? userData.subscriptionTier.charAt(0).toUpperCase() + userData.subscriptionTier.slice(1) : 'Loading...'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Next Billing</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {userData?.subscriptionEndDate ? formatDate(userData.subscriptionEndDate) : 'Loading...'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {userData?.subscriptionStartDate ? formatDate(userData.subscriptionStartDate) : 'Loading...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usage & Pricing */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        £{userData?.subscriptionTier ? getPlanPrice(userData.subscriptionTier) : '0.00'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Hours Remaining</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {userData ? (userData.hoursLimit - userData.hoursUsed).toFixed(1) : '0'} / {userData?.hoursLimit || '0'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span>Usage</span>
                      <span>{userData ? Math.round((userData.hoursUsed / userData.hoursLimit) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${userData ? (userData.hoursUsed / userData.hoursLimit) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

                         {/* Action Buttons */}
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <button 
                 onClick={() => router.push('/pricing')}
                 className="btn-secondary flex items-center gap-2"
               >
                 <Settings className="w-4 h-4" />
                 Change Plan
               </button>
               <button 
                 onClick={() => setShowCancelModal(true)}
                 className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
               >
                 <AlertTriangle className="w-4 h-4" />
                 Cancel Subscription
               </button>
             </div>

            {/* Usage History */}
            <div className="card mt-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Usage
              </h3>
              {recentTranscriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No transcriptions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTranscriptions.slice(0, 5).map((transcription, index) => (
                    <div key={transcription._id || index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transcription.videoTitle || 'Video Transcription'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {transcription.videoUrl ? new URL(transcription.videoUrl).hostname : 'Unknown source'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transcription.duration ? (transcription.duration / 3600).toFixed(2) : '0'} hours
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {transcription.createdAt ? new Date(transcription.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cancel Subscription
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to cancel your subscription? You'll lose access to StreamScribe at the end of your current billing period.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="btn-secondary flex-1"
                  disabled={isLoading}
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="btn-primary bg-red-600 hover:bg-red-700 flex-1 flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
