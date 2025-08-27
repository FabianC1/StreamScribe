'use client'

import { useSession } from 'next-auth/react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import TranscriptionForm from '../../components/TranscriptionForm'
import { Youtube } from 'lucide-react'
import { useState } from 'react'

export default function TranscribePage() {
  const { data: session, status } = useSession()
  const { user: customUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isTranscribing, setIsTranscribing] = useState(false)
  
  // Check for retry URL parameter
  const retryUrl = searchParams.get('retry')
  
  const isAuthenticated = status === 'authenticated' || !!customUser
  const isLoading = status === 'loading'

  const handleTranscribe = async (youtubeUrl: string) => {
    if (!isAuthenticated || isTranscribing) {
      return
    }
    
    setIsTranscribing(true)
    
    try {
      // Redirect to loading page immediately for better UX
      router.push(`/loading?url=${encodeURIComponent(youtubeUrl)}`)
    } catch (error) {
      console.error('Transcription error:', error)
      alert('Transcription failed. Please try again.')
      setIsTranscribing(false)
    }
  }

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push('/login')
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <Header />
        <main className="pt-28 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </main>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Check if user has active subscription
  const hasActiveSubscription = customUser?.subscriptionTier && customUser?.subscriptionStatus === 'active'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <Header />
      
      <main className="pt-28 pb-20">
        {/* Subscription Required Message */}
        {!hasActiveSubscription && (
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 border border-gray-200 dark:border-gray-700">
                <div className="h-24 w-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Youtube className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Subscription Required
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  You need an active subscription to access transcription services. Choose a plan that fits your needs and start transcribing videos instantly.
                </p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-colors duration-200"
                >
                  <Youtube className="h-6 w-6" />
                  Choose Your Plan
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Transcription Form Section - Only show if user has subscription */}
        {hasActiveSubscription && (
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <TranscriptionForm 
                onTranscribe={handleTranscribe}
                isLoading={isTranscribing}
                transcription={''} // transcription is removed
                disabled={false}
                retryUrl={retryUrl}
              />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
