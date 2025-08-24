'use client'

import { useState } from 'react'
import { Youtube, Play, Download, Copy, Check } from 'lucide-react'
import { transcribeVideo, validateYouTubeUrl } from '../lib/transcription'

interface TranscriptionFormProps {
  onTranscribe: (youtubeUrl: string) => Promise<void>
  isLoading: boolean
  transcription: string
}

export default function TranscriptionForm({ onTranscribe, isLoading, transcription }: TranscriptionFormProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!youtubeUrl.trim()) return
    
    await onTranscribe(youtubeUrl.trim())
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcription)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const downloadTranscript = () => {
    const blob = new Blob([transcription], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transcript.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const isValidYoutubeUrl = validateYouTubeUrl

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
          YouTube Video Transcription
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200 max-w-2xl mx-auto">
          Get accurate, timestamped transcripts in seconds with our advanced AI technology
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-10">
        <div className="flex flex-col sm:flex-row gap-6">
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
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                youtubeUrl && !isValidYoutubeUrl(youtubeUrl)
                  ? 'border-red-300 dark:border-red-500 focus:ring-red-500/20 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500'
              }`}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!youtubeUrl.trim() || isLoading || !isValidYoutubeUrl(youtubeUrl)}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 px-10 py-4 text-lg font-semibold hover:scale-105 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                Transcribing...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Transcribe
              </>
            )}
          </button>
        </div>
        
        {youtubeUrl && !isValidYoutubeUrl(youtubeUrl) && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-2">
            Please enter a valid YouTube URL
          </p>
        )}
      </form>

      {/* Transcription Result */}
      {transcription && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Transcription Result</h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="btn-secondary flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadTranscript}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto transition-colors duration-200">
            <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed transition-colors duration-200">
              {transcription}
            </p>
          </div>
          
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center transition-colors duration-200">
            <p>💡 Tip: You can copy the text above or download it as a text file</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Processing your video... This may take a few minutes.</p>
        </div>
      )}
      </div>
    </div>
  )
}
