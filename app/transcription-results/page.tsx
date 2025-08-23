'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TranscriptionHeader from '../../components/TranscriptionHeader'
import { 
  ArrowLeft, 
  Copy, 
  Edit3, 
  Play, 
  Download, 
  Star, 
  MessageSquare,
  Clock,
  FileText
} from 'lucide-react'

interface TranscriptSection {
  id: string
  timestamp: string
  text: string
  note?: string
}

export default function TranscriptionResultsPage() {
  const router = useRouter()
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [transcriptSections, setTranscriptSections] = useState<TranscriptSection[]>([
    {
      id: '1',
      timestamp: '00:00',
      text: 'Welcome to our comprehensive guide on artificial intelligence and machine learning. Today we\'ll be exploring the fundamental concepts that drive modern AI systems.'
    },
    {
      id: '2',
      timestamp: '00:15',
      text: 'Let\'s start with the basics. Artificial intelligence refers to the simulation of human intelligence in machines that are programmed to think and learn like humans.'
    },
    {
      id: '3',
      timestamp: '00:32',
      text: 'Machine learning, on the other hand, is a subset of AI that enables systems to automatically learn and improve from experience without being explicitly programmed.'
    },
    {
      id: '4',
      timestamp: '00:48',
      text: 'One of the most exciting developments in recent years has been the emergence of deep learning algorithms that can process vast amounts of data.'
    },
    {
      id: '5',
      timestamp: '01:05',
      text: 'These neural networks have revolutionized fields like computer vision, natural language processing, and autonomous systems.'
    },
    {
      id: '6',
      timestamp: '01:22',
      text: 'The key advantage of deep learning is its ability to automatically discover patterns and features in data that would be difficult for humans to identify.'
    },
    {
      id: '7',
      timestamp: '01:38',
      text: 'However, it\'s important to note that AI systems are only as good as the data they\'re trained on. Quality data is crucial for building reliable models.'
    },
    {
      id: '8',
      timestamp: '01:55',
      text: 'As we look to the future, the potential applications of AI are virtually limitless, from healthcare and education to transportation and entertainment.'
    }
  ])
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [highlights, setHighlights] = useState<string[]>([
    'Artificial intelligence refers to the simulation of human intelligence in machines',
    'Machine learning enables systems to automatically learn and improve from experience',
    'Deep learning algorithms can process vast amounts of data',
    'Quality data is crucial for building reliable AI models'
  ])
  const [keyQuotes, setKeyQuotes] = useState<string[]>([
    '"AI systems are only as good as the data they\'re trained on"',
    '"The potential applications of AI are virtually limitless"',
    '"Neural networks have revolutionized computer vision and NLP"'
  ])

  useEffect(() => {
    // Get YouTube URL from query parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const url = urlParams.get('url')
      if (url) {
        setYoutubeUrl(decodeURIComponent(url))
      }
    }
  }, [])

  const handleBackClick = () => {
    router.push('/')
  }

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      console.log('Copied to clipboard:', text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleAddNote = (sectionId: string) => {
    const note = prompt('Add a note for this section:')
    if (note) {
      setTranscriptSections(prev => 
        prev.map(section => 
          section.id === sectionId 
            ? { ...section, note: note }
            : section
        )
      )
    }
  }

  const handleJumpTo = (timestamp: string) => {
    // Convert timestamp to seconds and update video time
    const [minutes, seconds] = timestamp.split(':').map(Number)
    const timeInSeconds = minutes * 60 + seconds
    setCurrentVideoTime(timeInSeconds)
    // In a real implementation, you'd control the video player here
    console.log('Jumping to:', timestamp, 'seconds:', timeInSeconds)
  }

  const handleExport = () => {
    const transcriptText = transcriptSections
      .map(section => `[${section.timestamp}] ${section.text}`)
      .join('\n\n')
    
    const blob = new Blob([transcriptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transcript.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200">
      <TranscriptionHeader />
      
      <main className="pt-28 h-screen">
        <div className="flex h-full">
          {/* Left Section - Video Player */}
          <div className="w-1/3 p-6 border-r border-gray-200 dark:border-gray-700">
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Video Player
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Watch the video while following the transcript
                </p>
              </div>
              
              <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
                {/* Mock Video Player */}
                <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Video Player</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {youtubeUrl ? (
                        <span className="break-all">{youtubeUrl}</span>
                      ) : (
                        'YouTube Video Title'
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Current Time: {Math.floor(currentVideoTime / 60)}:{(currentVideoTime % 60).toString().padStart(2, '0')}</p>
                  </div>
                  
                  {/* Mock Video Controls */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentVideoTime / 120) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section - Transcript */}
          <div className="w-1/3 p-6 border-r border-gray-200 dark:border-gray-700">
            <div className="h-full flex flex-col">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Transcript
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click on timestamps to jump to specific parts of the video
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4">
                {transcriptSections.map((section) => (
                  <div
                    key={section.id}
                    className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 hover:bg-white/50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <button
                        onClick={() => handleJumpTo(section.timestamp)}
                        className="text-sm font-mono text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer"
                      >
                        {section.timestamp}
                      </button>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleCopyToClipboard(section.text)}
                          className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddNote(section.id)}
                          className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          title="Add note"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {section.text}
                    </p>
                    
                    {section.note && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-400 rounded">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                          <strong>Note:</strong> {section.note}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Insights & Actions */}
          <div className="w-1/3 p-6">
            <div className="h-full flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Insights & Actions
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Key highlights and export options
                </p>
              </div>
              
              <div className="flex-1 space-y-6">
                {/* Highlights */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Key Highlights
                  </h3>
                  <div className="space-y-2">
                    {highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {highlight}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Quotes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    Key Quotes
                  </h3>
                  <div className="space-y-2">
                    {keyQuotes.map((quote, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                          {quote}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Section */}
                <div className="mt-auto">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Download className="w-5 h-5 text-green-500" />
                    Export Options
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleExport}
                      className="w-full p-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Export as TXT
                    </button>
                    <button className="w-full p-3 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      Export as SRT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
