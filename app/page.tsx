'use client'

import { useState } from 'react'
import { Youtube, Play, Download, CheckCircle, Zap, Crown } from 'lucide-react'
import TranscriptionForm from '@/components/TranscriptionForm'
import PricingTiers from '@/components/PricingTiers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  const [transcription, setTranscription] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTranscription = async (youtubeUrl: string) => {
    setIsLoading(true)
    try {
      // This would integrate with your AI transcription service
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 3000))
      setTranscription('This is a sample transcription. In the real implementation, this would contain the actual transcribed text from the YouTube video using the Lemonfix AI service.')
    } catch (error) {
      console.error('Transcription failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Header />
      
      <main className="container mx-auto px-4 py-12 pt-28">
        {/* Hero Section */}
        <div className="text-center mb-16 hero-animate">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
            Transform YouTube Videos into
            <span className="text-primary-600 dark:text-primary-500 block">Accurate Transcripts</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 transition-colors duration-200">
            Powered by advanced AI technology, StreamScribe converts your YouTube videos into 
            precise, searchable text transcripts in minutes. Perfect for content creators, 
            researchers, and professionals.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>99.9% Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-500" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>

        {/* Transcription Form */}
        <div className="max-w-4xl mx-auto mb-16 form-animate">
          <TranscriptionForm 
            onTranscribe={handleTranscription}
            isLoading={isLoading}
            transcription={transcription}
          />
        </div>

        {/* Features Section */}
        <div id="features" className="mb-16 scroll-mt-20 section-animate">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 transition-colors duration-200">
            Why Choose StreamScribe?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center card-animate-1">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Youtube className="w-8 h-8 text-primary-600 dark:text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">YouTube Integration</h3>
              <p className="text-gray-600 dark:text-gray-300">Simply paste any YouTube URL and get instant transcription</p>
            </div>
            <div className="card text-center card-animate-2">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">High Accuracy</h3>
              <p className="text-gray-600 dark:text-gray-300">Advanced AI ensures 99.9% transcription accuracy</p>
            </div>
            <div className="card text-center card-animate-3">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Easy Export</h3>
              <p className="text-gray-600 dark:text-gray-300">Download transcripts in multiple formats</p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="mb-16 scroll-mt-20 section-animate">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 transition-colors duration-200">
            Choose Your Plan
          </h2>
          <PricingTiers />
        </div>
      </main>

      <Footer />
    </div>
  )
}
