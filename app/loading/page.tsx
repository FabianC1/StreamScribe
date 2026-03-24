'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function LoadingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [loadingText, setLoadingText] = useState('🚀 Starting transcription...')
  const [isCompleted, setIsCompleted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const redirectToVideoOnlyResults = (url: string, reason?: string) => {
    const encodedUrl = encodeURIComponent(url)
    const reasonParam = reason ? `&reason=${encodeURIComponent(reason)}` : ''
    router.push(`/transcription-results?url=${encodedUrl}&videoOnly=true${reasonParam}`)
  }

  useEffect(() => {
    const url = searchParams.get('url')
    if (url) {
      const decodedUrl = decodeURIComponent(url)
      setYoutubeUrl(decodedUrl)
      
      // Check if we're already processing this URL to prevent duplicates
      const processingKey = `processing_${decodedUrl}`
      if (localStorage.getItem(processingKey)) {
        console.log('🔄 Already processing this URL, skipping duplicate call')
        setLoadingText('🔄 Already processing this video...')
        return
      }
      
      // Mark as processing to prevent duplicates
      localStorage.setItem(processingKey, 'true')
      setIsProcessing(true)
      startTranscription(decodedUrl)
    }
    
    // Cleanup function to clear processing flag if component unmounts
    return () => {
      if (youtubeUrl) {
        localStorage.removeItem(`processing_${youtubeUrl}`)
      }
    }
  }, [searchParams])

  const startTranscription = async (url: string) => {
    try {
      setLoadingText('🚀 Starting transcription...')
      
      // Check if it's a test URL
      const isTestUrl = url.includes('test') || url.includes('example') || url.includes('demo')
      
      if (isTestUrl) {
        // Test mode - simulate transcription
        setTimeout(() => setLoadingText('🔗 Sending YouTube URL to AssemblyAI...'), 1000)
        setTimeout(() => setLoadingText('🎯 Starting AI transcription...'), 3000)
        setTimeout(() => setLoadingText('🎯 Starting AI transcription...'), 5000)
        setTimeout(() => setLoadingText('📝 Generating transcript with timestamps...'), 7000)
        setTimeout(() => {
          setLoadingText('✅ Transcription completed!')
          setIsCompleted(true)
          
          // Clear processing flag
          localStorage.removeItem(`processing_${url}`)
          
          // Redirect to results page after a short delay
          setTimeout(() => {
            const encodedUrl = encodeURIComponent(url)
            router.push(`/transcription-results?url=${encodedUrl}`)
          }, 1500)
        }, 8000)
        return
      }
      
      // Simulate some progress updates for better UX
      setTimeout(() => setLoadingText('🔗 Sending YouTube URL to AssemblyAI...'), 1000)
      setTimeout(() => setLoadingText('🎯 Starting AI transcription...'), 3000)
      setTimeout(() => setLoadingText('🎯 Starting AI transcription...'), 5000)
      setTimeout(() => setLoadingText('📝 Generating transcript with timestamps...'), 7000)
      
      // Start the transcription process
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: url }),
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.success) {
          // Store result and redirect
          localStorage.setItem('transcriptionResult', JSON.stringify(result))
          
          setLoadingText('✅ Transcription completed!')
          setIsCompleted(true)
          
          // Clear processing flag
          localStorage.removeItem(`processing_${url}`)
          
          // Redirect to results page after a short delay
          setTimeout(() => {
            const encodedUrl = encodeURIComponent(url)
            router.push(`/transcription-results?url=${encodedUrl}`)
          }, 1500)
        } else {
          throw new Error(result.error || 'Transcription failed')
        }
      } else {
        const errorData = await response.json()
        
        if (errorData.error === 'DUPLICATE_URL' || errorData.error === 'DUPLICATE_VIDEO') {
          // Handle duplicate video - redirect to dashboard
          setLoadingText('🚫 You have already transcribed this video!')
          setIsCompleted(true)
          
          // Clear processing flag
          localStorage.removeItem(`processing_${url}`)
          
          setTimeout(() => {
            router.push('/dashboard?duplicate=true')
          }, 2000)
        } else {
          throw new Error(errorData.error || 'Transcription failed')
        }
      }

    } catch (error) {
      console.error('Transcription failed:', error)
      setLoadingText('❌ Transcription failed. Please try again.')
      
      // Clear processing flag on error
      localStorage.removeItem(`processing_${url}`)

      // Redirect to the video/results page even when transcription fails
      setTimeout(() => {
        redirectToVideoOnlyResults(
          url,
          error instanceof Error ? error.message : 'Transcription failed'
        )
      }, 1500)
    }
  }

  const goBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-6">
        {/* Back Button */}
        <button
          onClick={goBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Main Loading Content */}
        <div className="mb-12">
          {/* Animated Circle */}
          <div className="w-32 h-32 mx-auto mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 dark:border-primary-400"></div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isCompleted ? 'Transcription Complete!' : 'Transcribing Your Video'}
          </h1>
          
          {/* Single changing text line - shows EXACT same text as terminal */}
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 min-h-[2rem] transition-all duration-500 font-mono">
            {loadingText}
          </p>
          
          {!isCompleted && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This may take 2-5 minutes depending on video length
            </p>
          )}
          
          {/* Test URL note */}
          {youtubeUrl.includes('test') && (
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
              🧪 Test mode - showing simulated progress
            </p>
          )}
          
          {/* Error state with retry button */}
          {loadingText.includes('❌') && (
            <div className="mt-6">
              <button
                onClick={() => startTranscription(youtubeUrl)}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Video URL Display */}
        {youtubeUrl && (
          <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Processing:</p>
            <p className="text-sm text-gray-900 dark:text-white break-all">{youtubeUrl}</p>
          </div>
        )}
      </div>
    </div>
  )
}
