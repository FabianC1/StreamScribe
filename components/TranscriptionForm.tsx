'use client'

import { useState } from 'react'
import { Youtube, Play, Download, Copy, Check } from 'lucide-react'
import { transcribeVideo, validateYouTubeUrl } from '@/lib/transcription'

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
    <div className="card">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
          Transcribe YouTube Videos
        </h2>
        <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
          Paste a YouTube URL below and get an accurate transcription in minutes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Youtube className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                youtubeUrl && !isValidYoutubeUrl(youtubeUrl)
                  ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!youtubeUrl.trim() || isLoading || !isValidYoutubeUrl(youtubeUrl)}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-8"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Transcribing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
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
  )
}
