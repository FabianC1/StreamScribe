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

  useEffect(() => {
    const url = searchParams.get('url')
    if (url) {
      const decodedUrl = decodeURIComponent(url)
      setYoutubeUrl(decodedUrl)
      startTranscription(decodedUrl)
    }
  }, [searchParams])

  const startTranscription = async (url: string) => {
    try {
      // Start progress tracking
      await fetch('/api/transcribe/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: url }),
      })

      // Start polling for progress updates
      const progressInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/transcribe/progress')
          const data = await response.json()
          
          if (data.progress) {
            setLoadingText(data.progress)
          }
          
          if (data.isCompleted) {
            setIsCompleted(true)
            clearInterval(progressInterval)
            
            // Make the actual API call to get results
            const transcriptionResponse = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ youtubeUrl: url }),
            })

            if (transcriptionResponse.ok) {
              const result = await transcriptionResponse.json()
              localStorage.setItem('transcriptionResult', JSON.stringify(result))
              
              // Redirect to results page
              setTimeout(() => {
                const encodedUrl = encodeURIComponent(url)
                router.push(`/transcription-results?url=${encodedUrl}`)
              }, 1500)
            }
          }
        } catch (error) {
          console.error('Progress polling error:', error)
        }
      }, 1000) // Poll every second

      // Start the transcription process
      fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: url }),
      })

    } catch (error) {
      console.error('Transcription failed:', error)
      setLoadingText('❌ Transcription failed. Please try again.')
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
            Transcribing Your Video
          </h1>
          
          {/* Single changing text line - shows EXACT same text as terminal */}
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 min-h-[2rem] transition-all duration-500 font-mono">
            {loadingText}
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This may take 2-5 minutes depending on video length
          </p>
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
