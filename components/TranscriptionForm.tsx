'use client'

import { useState, useEffect } from 'react'
import { Youtube, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react'

interface TranscriptionFormProps {
  onTranscribe: (youtubeUrl: string) => void
  isLoading: boolean
  transcription: string
  onInputFocus?: () => void
  disabled?: boolean
  retryUrl?: string | null
}

export default function TranscriptionForm({ onTranscribe, isLoading, transcription, onInputFocus, disabled = false, retryUrl }: TranscriptionFormProps) {
  const [youtubeUrl, setYoutubeUrl] = useState(retryUrl || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Handle retry URL
  useEffect(() => {
    if (retryUrl) {
      setYoutubeUrl(retryUrl)
      checkIfAlreadyTranscribed(retryUrl)
    }
  }, [retryUrl])

  // YouTube URL validation function
  const isValidYouTubeUrl = (url: string): boolean => {
    if (!url.trim()) return false
    
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      
      // Check if it's a YouTube domain
      if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be')) {
        return false
      }
      
      // Check if it has a video ID
      if (hostname.includes('youtube.com')) {
        return urlObj.searchParams.has('v')
      } else if (hostname.includes('youtu.be')) {
        return urlObj.pathname.length > 1
      }
      
      return false
    } catch {
      return false
    }
  }

  // Check if video already has a successful transcription
  const checkIfAlreadyTranscribed = async (url: string) => {
    if (!url.trim()) {
      setIsCached(false)
      setIsChecking(false)
      return
    }
    
    // isChecking is already set to true in handleUrlChange
    
    try {
      // Check if there's an existing successful transcription in the database
      const response = await fetch('/api/dashboard/transcriptions?limit=100')
      if (response.ok) {
        const data = await response.json()
        const existingTranscription = data.transcriptions?.find((t: any) => 
          t.youtubeUrl === url && t.status !== 'failed'
        )
        
        if (existingTranscription) {
          setIsCached(true)
          setIsChecking(false)
          return
        }
      }
      
      setIsCached(false)
    } catch (error) {
      console.warn('Failed to check existing transcriptions:', error)
      setIsCached(false)
    } finally {
      setIsChecking(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setYoutubeUrl(url)
    
    // Immediately show checking state for any URL input
    if (url.trim()) {
      setIsChecking(true)
      // Use setTimeout to debounce the API call
      setTimeout(() => checkIfAlreadyTranscribed(url), 500)
    } else {
      // If URL is empty, reset states
      setIsChecking(false)
      setIsCached(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!youtubeUrl.trim() || !isValidYouTubeUrl(youtubeUrl)) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Call the parent handler with the results
      onTranscribe(youtubeUrl.trim())
    } catch (err) {
      console.error('Transcription error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="relative group">
      {/* Animated gradient border background */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-400 via-secondary-500 to-primary-600 animate-gradient-border opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 p-[2px]">
        <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-800"></div>
      </div>
      
      {/* Main card */}
      <div className="card p-8 shadow-2xl border-2 border-transparent transition-all duration-200 relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600 dark:text-primary-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" fill="currentColor"/>
              <path d="m10 15 5-3-5-3z" fill="white"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
            {retryUrl ? 'Retry Transcription' : 'YouTube Video Transcription'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200 max-w-2xl mx-auto">
            {retryUrl ? 'Retry transcribing this video with our advanced AI technology' : 'Get accurate, timestamped transcripts in seconds with our advanced AI technology'}
          </p>
          {retryUrl && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                🔄 Retrying transcription for: {retryUrl}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" fill="currentColor"/>
                  <path d="m10 15 5-3-5-3z" fill="white"/>
                </svg>
              </div>
              <input
                type="url"
                value={youtubeUrl}
                onChange={handleUrlChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  youtubeUrl.trim() && !isValidYouTubeUrl(youtubeUrl)
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500'
                }`}
                disabled={isProcessing || isLoading || disabled}
                onFocus={onInputFocus}
              />
            </div>
                         <button
               type="submit"
               disabled={!isValidYouTubeUrl(youtubeUrl) || isLoading || isProcessing || disabled || isCached || isChecking}
               className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 px-8 py-4 text-lg font-semibold hover:scale-105 transition-all duration-200 whitespace-nowrap"
             >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Transcribing...
                </>
                             ) : isChecking ? (
                 <>
                   <Loader2 className="w-6 h-6 animate-spin" />
                   Checking...
                 </>
               ) : isCached ? (
                 <>
                   <Lock className="w-6 h-6" />
                   Already Transcribed
                 </>
               ) : (
                 <>
                   <CheckCircle className="w-6 h-6" />
                   {retryUrl ? 'Retry' : 'Transcribe'}
                 </>
               )}
            </button>
          </div>
          
          {/* Error and cache messages below the input/button row - absolute positioned */}
          <div className="relative mt-2 min-h-[2rem]">
            {youtubeUrl.trim() && !isValidYouTubeUrl(youtubeUrl) && (
              <div className="absolute top-0 left-0 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Please enter a valid YouTube URL
              </div>
            )}
                                     {isCached && (
              <div className="absolute top-0 left-0 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                You already transcribed this video.
              </div>
            )}
          </div>
          
          {/* Form submission errors */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mt-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <span className="text-base text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}
        </form>

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Preparing transcription...</p>
          </div>
        )}
      </div>
    </div>
  )
}
