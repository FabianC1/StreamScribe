'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import TranscriptionForm from '../../components/TranscriptionForm'
import { 
  Lock, 
  CheckCircle, 
  Clock, 
  Download,
  FileText,
  Video,
  Headphones,
  BarChart3,
  Star,
  Zap,
  Shield
} from 'lucide-react'

export default function AboutPage() {
  const { data: session, status } = useSession()
  const { user: customUser } = useAuth()
  const router = useRouter()
  
  const isAuthenticated = status === 'authenticated' || !!customUser
  const isLoading = status === 'loading'

  // Mock state for transcription form
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcription, setTranscription] = useState('')

  const handleTranscribe = async (youtubeUrl: string) => {
    if (!isAuthenticated) {
      // Show lock overlay or redirect to login
      return
    }
    
    setIsTranscribing(true)
    // TODO: Implement actual transcription logic
    console.log('Transcribing:', youtubeUrl)
    setTimeout(() => {
      setIsTranscribing(false)
      setTranscription('Sample transcription result...')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <Header />
      
      <main className="pt-28">
        {/* Hero Section */}
        <section className="text-center py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              AI-Powered Video Transcription
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Transform any YouTube video into accurate, searchable text with our advanced AI technology. 
              Get timestamps, speaker detection, and multiple export formats.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
              Why Choose StreamScribe?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  High Accuracy
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Industry-leading AI models for precise transcription with 99%+ accuracy
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Word-Level Timestamps
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Navigate to any moment in your content instantly with precise timing
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Multiple Formats
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Export as TXT, DOCX, SRT, VTT, MP3, or MP4 based on your plan
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Advanced Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get insights, key quotes, and action items from your content
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Secure & Private
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your content is processed securely and never shared with third parties
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Lightning Fast
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Process videos up to 10x faster than traditional transcription services
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Transcription Form Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Try It Now
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Experience the power of AI transcription with any YouTube video
                </p>
              </div>

              {/* Lock Overlay for Non-Authenticated Users */}
              <div className="relative group">
                {!isAuthenticated && (
                  <div className="absolute inset-0 bg-blue-600/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300 rounded-2xl z-20">
                    <div className="text-center text-white">
                      <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm shadow-lg">
                        <Lock className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold mb-4">Transcription Locked</h3>
                      <p className="text-blue-100 text-xl">
                        Sign up to unlock AI-powered transcription
                      </p>
                    </div>
                  </div>
                )}

                <TranscriptionForm 
                  onTranscribe={handleTranscribe}
                  isLoading={isTranscribing}
                  transcription={transcription}
                  disabled={!isAuthenticated}
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of users who trust StreamScribe for their transcription needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Get Started
              </a>
              <a
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                View Pricing
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
