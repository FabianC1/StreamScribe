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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <Header />
      
      <main className="pt-28 pb-20">
        {/* Transcription Form Section */}
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
      </main>

      <Footer />
    </div>
  )
}
