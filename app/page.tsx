'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import TranscriptionForm from '../components/TranscriptionForm'
import PricingTiers from '../components/PricingTiers'
import Footer from '../components/Footer'
import { 
  Play, 
  Clock, 
  Download, 
  Globe, 
  Zap, 
  Shield, 
  Users, 
  Star, 
  CheckCircle, 
  BarChart3,
  FileText,
  Headphones,
  Monitor,
  Target
} from 'lucide-react'

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [transcription, setTranscription] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    // Handle hash navigation for anchor links
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash) {
        const element = document.querySelector(hash)
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }
      }
    }
  }, [])

  const handleTranscription = async (youtubeUrl: string) => {
    setIsLoading(true)
    try {
      // This would integrate with your AI transcription service
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Redirect to transcription results page with the URL
      const encodedUrl = encodeURIComponent(youtubeUrl)
      window.location.href = `/transcription-results?url=${encodedUrl}`
    } catch (error) {
      console.error('Transcription failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200">
      <Header />
      
      <main className="pt-28">
        {/* Hero Section */}
        <section className={`text-center py-20 px-4 hero-animate transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                AI-Powered Transcription
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Transform YouTube Videos
                <span className="block text-primary-600 dark:text-primary-400">Into Perfect Transcripts</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                Get accurate, timestamped transcripts in seconds. Perfect for content creators, researchers, and professionals who need reliable video-to-text conversion.
              </p>
              
              {/* Hero Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-8">
                <div className="text-center p-3 md:p-0">
                  <div className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1 md:mb-2">99.5%</div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</div>
                </div>
                <div className="text-center p-3 md:p-0">
                  <div className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1 md:mb-2">50+</div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Languages</div>
                </div>
                <div className="text-center p-3 md:p-0">
                  <div className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1 md:mb-2">24/7</div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Processing</div>
                </div>
                <div className="text-center p-3 md:p-0">
                  <div className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1 md:mb-2">10k+</div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Happy Users</div>
                </div>
              </div>

              
            </div>

            
          </div>
        </section>

                 {/* Transcription Form Section - Main Focus */}
         <section id="transcription-form" className="py-24 px-4 form-animate">
           <div className="max-w-5xl mx-auto">
             <div className="text-center mb-16">
               <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                 Start Transcribing Now
               </h2>
               <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                 Transform any YouTube video into a perfect transcript in seconds
               </p>
             </div>
             
             <div className="max-w-4xl mx-auto">
               <TranscriptionForm 
                 onTranscribe={handleTranscription}
                 isLoading={isLoading}
                 transcription={transcription}
               />
             </div>
             
             
           </div>
         </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 section-animate">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose StreamScribe?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our advanced AI technology and user-friendly platform make video transcription effortless and accurate
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Feature 1 */}
              <div className={`card p-6 text-center transition-all duration-200 hover:scale-105 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 group-hover:scale-110">
                  <Zap className="w-8 h-8 text-primary-600 dark:text-primary-500 transition-all duration-200 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Lightning Fast</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get transcripts in seconds, not hours. Our AI processes videos 10x faster than traditional methods.
                </p>
              </div>

              {/* Feature 2 */}
              <div className={`card p-6 text-center transition-all duration-200 hover:scale-105 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 group-hover:scale-110">
                  <Target className="w-8 h-8 text-primary-600 dark:text-primary-500 transition-all duration-200 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">99.5% Accuracy</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Industry-leading accuracy with advanced speech recognition and natural language processing.
                </p>
              </div>

              {/* Feature 3 */}
              <div className={`card p-6 text-center transition-all duration-200 hover:scale-105 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 group-hover:scale-110">
                  <Globe className="w-8 h-8 text-primary-600 dark:text-primary-500 transition-all duration-200 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">50+ Languages</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Support for major world languages with automatic language detection and translation.
                </p>
              </div>

              {/* Feature 4 */}
              <div className={`card p-6 text-center transition-all duration-200 hover:scale-105 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 group-hover:scale-110">
                  <Clock className="w-8 h-8 text-primary-600 dark:text-primary-500 transition-all duration-200 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Timestamps</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Precise timestamps for every word, making it easy to navigate and reference specific parts.
                </p>
              </div>

              {/* Feature 5 */}
              <div className={`card p-6 text-center transition-all duration-200 hover:scale-105 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 group-hover:scale-110">
                  <Download className="w-8 h-8 text-primary-600 dark:text-primary-500 transition-all duration-200 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Multiple Formats</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Export in TXT, SRT, VTT, or PDF formats for maximum compatibility with your workflow.
                </p>
              </div>

              {/* Feature 6 */}
              <div className={`card p-6 text-center transition-all duration-200 hover:scale-105 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 group-hover:scale-110">
                  <Shield className="w-8 h-8 text-primary-600 dark:text-primary-500 transition-all duration-200 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Enterprise Security</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Bank-level encryption and GDPR compliance ensure your content stays private and secure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 section-animate">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Three simple steps to get your perfect transcript
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className={`text-center transition-all duration-200 hover:scale-105 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 group-hover:scale-110">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-500 transition-all duration-200 group-hover:scale-110">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Paste URL</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Simply copy and paste any YouTube video URL into our transcription form
                </p>
              </div>

              <div className={`text-center transition-all duration-200 hover:scale-105 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 group-hover:scale-110">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-500 transition-all duration-200 group-hover:scale-110">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">AI Processing</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our advanced AI analyzes the audio and generates a highly accurate transcript
                </p>
              </div>

              <div className={`text-center transition-all duration-200 hover:scale-105 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 group-hover:scale-110">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-500 transition-all duration-200 group-hover:scale-110">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Download</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Download your transcript in multiple formats and start using it immediately
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 px-4 section-animate">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Perfect For Every Need
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Whether you're a content creator, researcher, or business professional, StreamScribe has you covered
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`card p-6 text-center transition-all duration-200 hover:scale-105 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 group-hover:scale-110">
                  <Monitor className="w-8 h-8 text-primary-600 dark:text-primary-500 transition-all duration-200 group-hover:scale-110" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content Creators</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Create captions, blog posts, and social media content from your videos
                </p>
              </div>

              <div className={`card p-6 text-center transition-all duration-200 hover:scale-105 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 group-hover:scale-110">
                  <BarChart3 className="w-8 h-8 text-primary-600 dark:text-primary-500 transition-all duration-200 group-hover:scale-110" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Researchers</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Analyze interviews, lectures, and research presentations with ease
                </p>
              </div>

              <div className={`card p-6 text-center transition-all duration-200 hover:scale-105 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 group-hover:scale-110">
                  <Users className="w-8 h-8 text-primary-600 dark:text-primary-500 transition-all duration-200 group-hover:scale-110" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Business Teams</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Document meetings, training sessions, and presentations
                </p>
              </div>

              <div className={`card p-6 text-center transition-all duration-200 hover:scale-105 group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-200 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 group-hover:scale-110">
                  <Headphones className="w-8 h-8 text-primary-600 dark:text-primary-500 transition-all duration-200 group-hover:scale-110" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Accessibility</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Make your content accessible to hearing-impaired audiences
                </p>
              </div>
            </div>
          </div>
        </section>

        

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 section-animate">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Choose Your Plan
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Start with our free tier and upgrade as you grow. All plans include our core features and 24/7 support.
              </p>
            </div>
            <PricingTiers />
          </div>
        </section>

                 {/* Testimonials Section */}
         <section className="py-20 px-4 section-animate">
           <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                 Loved by Thousands
               </h2>
               <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                 See what our users are saying about StreamScribe
               </p>
             </div>

             <div className="grid md:grid-cols-3 gap-8">
               <div className={`card p-6 transition-all duration-200 hover:scale-105 ${
                 isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
               }`}>
                 <div className="flex items-center gap-1 mb-4">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                   ))}
                 </div>
                 <p className="text-gray-600 dark:text-gray-300 mb-4">
                   "StreamScribe has revolutionized my content creation workflow. I can now turn my YouTube videos into blog posts in minutes instead of hours!"
                 </p>
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                     <span className="text-sm font-semibold text-primary-600 dark:text-primary-500">S</span>
                   </div>
                   <div>
                     <div className="font-semibold text-gray-900 dark:text-white">Sarah Chen</div>
                     <div className="text-sm text-gray-500 dark:text-gray-400">Content Creator</div>
                   </div>
                 </div>
               </div>

               <div className={`card p-6 transition-all duration-200 hover:scale-105 ${
                 isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
               }`}>
                 <div className="flex items-center gap-1 mb-4">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                   ))}
                 </div>
                 <p className="text-gray-600 dark:text-gray-300 mb-4">
                   "As a researcher, I need accurate transcripts of interviews. StreamScribe delivers 99.5% accuracy every time. It's become an essential tool in my toolkit."
                 </p>
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                     <span className="text-sm font-semibold text-primary-600 dark:text-primary-500">D</span>
                   </div>
                   <div>
                     <div className="font-semibold text-gray-900 dark:text-white">Dr. Michael Rodriguez</div>
                     <div className="text-sm text-gray-500 dark:text-gray-400">Research Professor</div>
                   </div>
                 </div>
               </div>

               <div className={`card p-6 transition-all duration-200 hover:scale-105 ${
                 isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
               }`}>
                 <div className="flex items-center gap-1 mb-4">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                   ))}
                 </div>
                 <p className="text-gray-600 dark:text-gray-300 mb-4">
                   "Our marketing team uses StreamScribe to transcribe client meetings and training sessions. The accuracy and speed are incredible!"
                 </p>
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                     <span className="text-sm font-semibold text-primary-600 dark:text-primary-500">E</span>
                   </div>
                   <div>
                     <div className="font-semibold text-gray-900 dark:text-white">Emma Thompson</div>
                     <div className="text-sm text-gray-500 dark:text-gray-400">Marketing Director</div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </section>
      </main>

      <Footer />
    </div>
  )
}
