'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Youtube, Play, Loader2, CheckCircle, AlertCircle, FileText, Download, Share2 } from 'lucide-react'
import ThemeToggle from '../../components/ThemeToggle'

export default function TranscribePage() {
  const { data: session, status } = useSession()
  const { user: customUser } = useAuth()
  const router = useRouter()
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionResult, setTranscriptionResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  // Check if user is authenticated
  const isAuthenticated = status === 'authenticated' || !!customUser

  useEffect(() => {
    if (status === 'loading') return
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [status, isAuthenticated, router])

  const handleTranscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!youtubeUrl.trim()) return

    setIsTranscribing(true)
    setError('')
    setProgress(0)
    setTranscriptionResult(null)

    try {
      // Simulate transcription process with progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Mock API call - replace with actual transcription API
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      clearInterval(progressInterval)
      setProgress(100)

      // Mock result - replace with actual API response
      const mockResult = {
        videoTitle: 'Sample YouTube Video',
        transcription: 'This is a sample transcription of the video content...',
        highlights: [
          'Key point 1: Important information about the topic',
          'Key point 2: Another significant insight',
          'Key point 3: Final takeaway from the video'
        ],
        duration: '5:30',
        wordCount: 1250
      }

      setTranscriptionResult(mockResult)
    } catch (error) {
      setError('Transcription failed. Please try again.')
    } finally {
      setIsTranscribing(false)
      setProgress(0)
    }
  }

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const getVideoThumbnail = (url: string) => {
    const videoId = extractVideoId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }
// 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" fill="white"/>
                  <path d="m10 15 5-3-5-3z" fill="#2563EB"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">StreamScribe</span>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Transcribe YouTube Videos
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform any YouTube video into searchable, editable text with AI-powered accuracy and intelligent highlights.
          </p>
        </div>

        {/* Transcription Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <form onSubmit={handleTranscribe} className="space-y-6">
            <div>
              <label htmlFor="youtubeUrl" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                YouTube Video URL
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Youtube className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="youtubeUrl"
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg transition-colors duration-200"
                    disabled={isTranscribing}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!youtubeUrl.trim() || isTranscribing}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Transcribe
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Video Preview */}
          {youtubeUrl && getVideoThumbnail(youtubeUrl) && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center gap-4">
                <img
                  src={getVideoThumbnail(youtubeUrl) || ''}
                  alt="Video thumbnail"
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Video Preview</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ready to transcribe</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isTranscribing && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transcribing...</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Transcription Results */}
        {transcriptionResult && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Result Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {transcriptionResult.videoTitle}
                  </h2>
                  <div className="flex items-center gap-6 text-blue-100">
                    <span className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      {transcriptionResult.duration}
                    </span>
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {transcriptionResult.wordCount} words
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200">
                    <Download className="h-5 w-5 text-white" />
                  </button>
                  <button className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200">
                    <Share2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Result Content */}
            <div className="p-8">
              {/* AI Highlights */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  AI-Generated Highlights
                </h3>
                <div className="space-y-3">
                  {transcriptionResult.highlights.map((highlight: string, index: number) => (
                    <div key={index} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-green-800 dark:text-green-200">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Transcription */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Full Transcription</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg max-h-96 overflow-y-auto">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {transcriptionResult.transcription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
      </main>
    </div>
  )
}
