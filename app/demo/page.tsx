'use client'

import { useState } from 'react'
import { Youtube, Play, Download, Copy, Check } from 'lucide-react'

export default function DemoPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [transcription, setTranscription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!youtubeUrl.trim()) return
    
    setIsLoading(true)
    try {
      // Simulate transcription process
      await new Promise(resolve => setTimeout(resolve, 3000))
      setTranscription(`This is a demo transcription for: ${youtubeUrl}

In a real implementation, this would contain the actual transcribed text from the Lemonfix AI service.

The transcription would include:
- Accurate speech-to-text conversion
- Proper punctuation and formatting
- Speaker identification (if available)
- Timestamps for each segment
- Confidence scores for accuracy

This is just a demonstration of the user interface and workflow.`)
    } catch (error) {
      console.error('Transcription failed:', error)
    } finally {
      setIsLoading(false)
    }
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
    a.download = 'demo-transcript.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const isValidYoutubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
              StreamScribe Demo
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">
              Try out our YouTube transcription service without signing up
            </p>
          </div>

          <div className="card">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                Demo Transcription
              </h2>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                Paste a YouTube URL below to see how the transcription works
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Try Demo
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

            {/* Demo Result */}
            {transcription && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Demo Result</h3>
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
                  <p>💡 This is a demo result. Sign up for a subscription to get real transcriptions!</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Processing your demo video... This may take a few minutes.</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
              Ready to get started?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-200">
              Sign up for a subscription to access real AI-powered transcription
            </p>
            <a href="/" className="btn-primary">
              View Pricing Plans
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
