'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Header from '../../components/Header'

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    // Get session ID from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const sessionIdParam = urlParams.get('session_id')
    setSessionId(sessionIdParam)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200">
      <Header />
      <div className="max-w-md mx-auto text-center p-8 pt-28 hero-animate">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-200">
          Thank you for subscribing to StreamScribe! Your account has been activated and you can now start transcribing YouTube videos.
        </p>

        {sessionId && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 transition-colors duration-200">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Session ID:</p>
            <p className="text-xs font-mono text-gray-700 dark:text-gray-200 break-all">{sessionId}</p>
          </div>
        )}

        <div className="space-y-4">
          <Link 
            href="/transcribe"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Start Transcribing
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
            You'll receive a confirmation email shortly with your subscription details.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-200">
            What's Next?
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 transition-colors duration-200">
            <li>• Paste any YouTube URL to get started</li>
            <li>• Your transcription hours are now available</li>
            <li>• Download transcripts in multiple formats</li>
            <li>• Access advanced features based on your plan</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
