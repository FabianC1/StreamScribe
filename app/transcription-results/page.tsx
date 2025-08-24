'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TranscriptionHeader from '../../components/TranscriptionHeader'
import { 
  Play, 
  Clock, 
  Download, 
  Copy, 
  Check, 
  Edit3, 
  MessageSquare, 
  ArrowLeft, 
  History, 
  Move, 
  Minus, 
  Plus, 
  Youtube,
  X,
  Save,
  Trash2
} from 'lucide-react'

interface TranscriptionData {
  transcript: string
  confidence: number
  audio_duration: number
  words: Array<{
    text: string
    start: number
    end: number
    confidence: number
    speaker: string
  }>
  highlights: Array<{
    count: number
    rank: number
    text: string
    timestamps: Array<{ start: number; end: number }>
  }>
  sentiment: Array<{
    text: string
    start: number
    end: number
    sentiment: string
    confidence: number
  }>
  chapters: Array<{
    summary: string
    headline: string
    start: number
    end: number
  }>
  entities: Array<{
    text: string
    entity_type: string
    start: number
    end: number
  }>
  speaker_labels: Array<{
    speaker: string
    start: number
    end: number
  }>
  language_code: string
  youtube_url: string
}

interface Note {
  id: string
  sectionId: string
  text: string
  timestamp: string
}

export default function TranscriptionResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transcriptionData, setTranscriptionData] = useState<TranscriptionData | null>(null)
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [showNotes, setShowNotes] = useState(true)

  useEffect(() => {
    // Get YouTube URL from query parameters
    const url = searchParams.get('url')
    const fromHistory = searchParams.get('fromHistory')
    
    if (url) {
      const decodedUrl = decodeURIComponent(url)
      setYoutubeUrl(decodedUrl)
      fetchTranscriptionData(decodedUrl)
    } else {
      setError('No YouTube URL provided')
      setIsLoading(false)
    }
    
    // If coming from history, we could load saved data here
    if (fromHistory === 'true') {
      // In a real app, this would load the saved transcription data
      console.log('Loading from history...')
    }
  }, [searchParams])

  const fetchTranscriptionData = async (url: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // For now, we'll simulate the API call with mock data
      // In production, this would call your actual /api/transcribe endpoint
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API delay
      
      // Mock data that matches the AssemblyAI format
      const mockData: TranscriptionData = {
        transcript: "Hello everyone, welcome to this amazing video about artificial intelligence and machine learning. Today we're going to explore the fascinating world of AI and how it's transforming our daily lives. From virtual assistants to autonomous vehicles, AI is everywhere around us. Let me share some incredible insights about the future of technology and how it will shape our world in the coming years.",
        confidence: 0.95,
        audio_duration: 1800,
        words: [
          { text: "Hello", start: 0, end: 0.5, confidence: 0.98, speaker: "A" },
          { text: "everyone", start: 0.5, end: 1.2, confidence: 0.96, speaker: "A" },
          { text: "welcome", start: 1.2, end: 1.8, confidence: 0.97, speaker: "A" },
          { text: "to", start: 1.8, end: 2.0, confidence: 0.99, speaker: "A" },
          { text: "this", start: 2.0, end: 2.3, confidence: 0.95, speaker: "A" },
          { text: "amazing", start: 2.3, end: 3.0, confidence: 0.94, speaker: "A" },
          { text: "video", start: 3.0, end: 3.5, confidence: 0.97, speaker: "A" },
          { text: "about", start: 3.5, end: 3.8, confidence: 0.98, speaker: "A" },
          { text: "artificial", start: 3.8, end: 4.5, confidence: 0.93, speaker: "A" },
          { text: "intelligence", start: 4.5, end: 5.2, confidence: 0.92, speaker: "A" }
        ],
        highlights: [
          { count: 3, rank: 1, text: "artificial intelligence", timestamps: [{ start: 3.8, end: 5.2 }] },
          { count: 2, rank: 2, text: "machine learning", timestamps: [{ start: 5.5, end: 6.8 }] },
          { count: 2, rank: 3, text: "technology", timestamps: [{ start: 12.3, end: 13.1 }] }
        ],
        sentiment: [
          { text: "Hello everyone, welcome to this amazing video", start: 0, end: 3.5, sentiment: "positive", confidence: 0.89 },
          { text: "Today we're going to explore the fascinating world", start: 5.5, end: 8.2, sentiment: "positive", confidence: 0.91 }
        ],
        chapters: [
          { summary: "Introduction to AI and ML", headline: "Welcome & Overview", start: 0, end: 300 },
          { summary: "AI in daily life", headline: "AI Applications", start: 300, end: 600 },
          { summary: "Future of technology", headline: "Looking Forward", start: 600, end: 900 }
        ],
        entities: [
          { text: "artificial intelligence", entity_type: "technology", start: 3.8, end: 5.2 },
          { text: "machine learning", entity_type: "technology", start: 5.5, end: 6.8 },
          { text: "virtual assistants", entity_type: "technology", start: 8.5, end: 9.8 }
        ],
        speaker_labels: [
          { speaker: "A", start: 0, end: 1800 }
        ],
        language_code: "en",
        youtube_url: url
      }
      
      setTranscriptionData(mockData)
    } catch (err) {
      console.error('Failed to fetch transcription data:', err)
      setError('Failed to load transcription data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopyToClipboard = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSectionId(sectionId)
      setTimeout(() => setCopiedSectionId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleAddNote = (sectionId: string) => {
    setEditingNoteId(sectionId)
    setNoteInput('')
  }

  const handleSaveNote = () => {
    if (noteInput.trim() && editingNoteId) {
      const newNote: Note = {
        id: Date.now().toString(),
        sectionId: editingNoteId,
        text: noteInput.trim(),
        timestamp: new Date().toLocaleTimeString()
      }
      setNotes(prev => [...prev, newNote])
      setEditingNoteId(null)
      setNoteInput('')
    }
  }

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId))
  }

  const jumpToTime = (startTime: number) => {
    setCurrentVideoTime(startTime)
    // In a real app, this would control the video player
    console.log(`Jumping to ${startTime} seconds`)
  }

  const getSectionNotes = (sectionId: string) => {
    return notes.filter(note => note.sectionId === sectionId)
  }

  if (isLoading) {
    return (
      <>
        <TranscriptionHeader />
        <main className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading Transcription...</h2>
              <p className="text-gray-600 dark:text-gray-300">Processing your video, please wait</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (error || !transcriptionData) {
    return (
      <>
        <TranscriptionHeader />
        <main className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Transcription Failed</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{error || 'Unable to load transcription data'}</p>
              <button 
                onClick={() => window.history.back()}
                className="btn-primary"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <TranscriptionHeader />
      
      <main className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200">
        <div className="w-full h-full">
          {/* Mobile-First Responsive Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 p-4 xl:h-[calc(100vh-80px)]">
            {/* Left Section - Video Player */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-h-[500px] xl:min-h-0">
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary-600" />
                  Video Player
                </h3>
                
                {/* Mock Video Player */}
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative group mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600 opacity-20 rounded-lg"></div>
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 backdrop-blur-sm">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <p className="text-white font-medium text-sm sm:text-base">Video Player</p>
                    <p className="text-white/70 text-xs sm:text-sm mt-1">Click to play</p>
                  </div>
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                    <div className="bg-black/50 rounded-full h-1">
                      <div 
                        className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${(currentVideoTime / transcriptionData.audio_duration) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-white text-xs mt-2">
                      <span>{formatTime(currentVideoTime)}</span>
                      <span>{formatTime(transcriptionData.audio_duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Video Information</h4>
                    {searchParams.get('fromHistory') === 'true' && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs rounded-full">
                        From History
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Youtube className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="break-all">{youtubeUrl || 'YouTube Video Title'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Duration: {formatTime(transcriptionData.audio_duration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Confidence: {(transcriptionData.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Language: {transcriptionData.language_code.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {showNotes && (
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
                        Video Notes
                      </h4>
                      <button
                        onClick={() => handleAddNote('video')}
                        className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                      >
                        + Add Note
                      </button>
                    </div>
                    
                    <div className="space-y-2 overflow-y-auto max-h-32 sm:max-h-40 custom-scrollbar">
                      {editingNoteId === 'video' && (
                        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <textarea
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            placeholder="Add a note about this video..."
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleSaveNote}
                              className="px-2 sm:px-3 py-1 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-2 sm:px-3 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {getSectionNotes('video').map(note => (
                        <div key={note.id} className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex-1">{note.text}</p>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{note.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Section - Transcript */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-h-[600px] xl:min-h-0">
              <div className="p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  Transcript
                </h3>

                {/* Transcript Content */}
                <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar">
                  {transcriptionData.words.map((word, index) => (
                    <div key={index} className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                        <button
                          onClick={() => jumpToTime(word.start)}
                          className="text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors hover:underline"
                        >
                          {formatTime(word.start)}
                        </button>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleCopyToClipboard(word.text, `word-${index}`)}
                            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                              copiedSectionId === `word-${index}`
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 scale-110'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                            }`}
                            title="Copy to clipboard"
                          >
                            {copiedSectionId === `word-${index}` ? (
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleAddNote(`word-${index}`)}
                            className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 transition-all duration-300"
                            title="Add note"
                          >
                            <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{word.text}</p>
                      
                      {/* Note Input for this section */}
                      {editingNoteId === `word-${index}` && (
                        <div className="mt-3 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                          <textarea
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            placeholder="Add a note about this section..."
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleSaveNote}
                              className="px-2 sm:px-3 py-1 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-2 sm:px-3 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Notes for this section */}
                      {getSectionNotes(`word-${index}`).map(note => (
                        <div key={note.id} className="mt-3 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex-1">{note.text}</p>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{note.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Export Options */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Export Options</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {['TXT', 'SRT', 'VTT', 'PDF'].map((format) => (
                      <button
                        key={format}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        {format}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Insights & Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-h-[500px] xl:min-h-0">
              <div className="p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  Insights & Actions
                </h3>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {/* Key Highlights */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
                      Key Highlights
                    </h4>
                    <div className="space-y-1">
                      {transcriptionData.highlights.map((highlight, index) => (
                        <div key={index} className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">{highlight.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Quotes */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
                      Key Quotes
                    </h4>
                    <div className="space-y-2">
                      {transcriptionData.sentiment.slice(0, 3).map((sentiment, index) => (
                        <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 italic">"{sentiment.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Items */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
                      Action Items
                    </h4>
                    <div className="space-y-1">
                      {transcriptionData.chapters.map((chapter, index) => (
                        <div key={index} className="p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                          <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-200">{chapter.headline}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout Instructions */}
          <div className="mt-8 text-center xl:hidden">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Mobile View</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Sections are stacked vertically on mobile for better viewing experience. Each section is now tall enough to see content and add notes comfortably.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
