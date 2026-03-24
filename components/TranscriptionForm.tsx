'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react'

interface TranscriptionFormProps {
  onTranscribe: (youtubeUrl: string) => void
  isLoading: boolean
  transcription: string
  onInputFocus?: () => void
  disabled?: boolean
  retryUrl?: string | null
}

export default function TranscriptionForm({ onTranscribe: _onTranscribe, isLoading, transcription: _transcription, onInputFocus, disabled = false, retryUrl }: TranscriptionFormProps) {
  const router = useRouter()
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mediaFile) {
      setError('Please choose a video or audio file to transcribe')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('mediaFile', mediaFile)

      const response = await fetch('/api/transcribe-upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to transcribe uploaded media')
      }

      localStorage.setItem('transcriptionResult', JSON.stringify(result))
      router.push(`/transcription-results?url=${encodeURIComponent(result.youtube_url)}&uploaded=true`)
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
            <Upload className="w-10 h-10 text-primary-600 dark:text-primary-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
            {retryUrl ? 'Retry File Transcription' : 'Upload Media for Transcription'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200 max-w-2xl mx-auto">
            {retryUrl ? 'Choose the local file you want to process again.' : 'Upload a downloaded video or audio file and get a timestamped transcript without relying on YouTube extraction.'}
          </p>
          {retryUrl && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Select the file again to rerun transcription.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500"
                disabled={isProcessing || isLoading || disabled}
                onFocus={onInputFocus}
              />
            </div>
                         <button
               type="submit"
                 disabled={!mediaFile || isLoading || isProcessing || disabled}
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
               ) : (
                 <>
                   <CheckCircle className="w-6 h-6" />
                                   {retryUrl ? 'Retry Upload' : 'Transcribe File'}
                 </>
               )}
            </button>
          </div>
          
          {/* Error and cache messages below the input/button row - absolute positioned */}
          <div className="relative mt-2 min-h-[2rem]">
            {mediaFile && (
              <div className="absolute top-0 left-0 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Selected file: {mediaFile.name}
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
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Uploading media and preparing transcription...</p>
          </div>
        )}
      </div>
    </div>
  )
}
