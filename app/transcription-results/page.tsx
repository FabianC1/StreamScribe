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

interface TranscriptSection {
  id: string
  timestamp: string
  text: string
  startTime: number
  endTime: number
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
  const [isLoading, setIsLoading] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [highlights, setHighlights] = useState<string[]>([])
  const [keyQuotes, setKeyQuotes] = useState<string[]>([])
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Note[]>([
    // Mock notes to demonstrate scrollbars
    { id: '1', sectionId: 'video', text: 'This is a sample video note to show the scrollbar functionality.', timestamp: '10:30 AM' },
    { id: '2', sectionId: 'video', text: 'Another video note to demonstrate scrolling when there are many notes.', timestamp: '10:31 AM' },
    { id: '3', sectionId: 'video', text: 'Third video note to ensure the scrollbar appears.', timestamp: '10:32 AM' },
    { id: '4', sectionId: 'video', text: 'Fourth video note to fill the space.', timestamp: '10:33 AM' },
    { id: '5', sectionId: 'video', text: 'Fifth video note to trigger overflow.', timestamp: '10:34 AM' },
  ])
  const [showNotes, setShowNotes] = useState(true)

  // Mock transcript sections
  const transcriptSections: TranscriptSection[] = [
    {
      id: '1',
      timestamp: '0:00',
      text: 'Welcome to this comprehensive guide on artificial intelligence and machine learning.',
      startTime: 0,
      endTime: 5
    },
    {
      id: '2',
      timestamp: '0:05',
      text: 'Today we will explore the fundamental concepts that drive modern AI systems.',
      startTime: 5,
      endTime: 10
    },
    {
      id: '3',
      timestamp: '0:10',
      text: 'From neural networks to deep learning algorithms, we will cover everything you need to know.',
      startTime: 10,
      endTime: 15
    },
    {
      id: '4',
      timestamp: '0:15',
      text: 'Let us begin with the basics of machine learning and how it differs from traditional programming.',
      startTime: 15,
      endTime: 20
    },
    {
      id: '5',
      timestamp: '0:20',
      text: 'Machine learning enables computers to learn patterns from data without explicit programming.',
      startTime: 20,
      endTime: 25
    }
  ]

  useEffect(() => {
    // Get YouTube URL from query parameters
    const url = searchParams.get('url')
    const fromHistory = searchParams.get('fromHistory')
    
    if (url) {
      setYoutubeUrl(decodeURIComponent(url))
    }
    
    // If coming from history, we could load saved data here
    if (fromHistory === 'true') {
      // In a real app, this would load the saved transcription data
      console.log('Loading from history...')
    }
  }, [searchParams])

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

  const handleJumpToTime = (startTime: number) => {
    setCurrentVideoTime(startTime)
    // In a real app, this would control the video player
    console.log(`Jumping to ${startTime} seconds`)
  }

  const getSectionNotes = (sectionId: string) => {
    return notes.filter(note => note.sectionId === sectionId)
  }

  return (
    <>
      <TranscriptionHeader />
      
      <main className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200">
        <div className="w-full h-full">
          {/* Mobile-First Responsive Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 p-4 h-[calc(100vh-80px)]">
            {/* Left Section - Video Player */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
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
                        style={{ width: `${(currentVideoTime / 300) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-white text-xs mt-2">
                      <span>{Math.floor(currentVideoTime / 60)}:{(currentVideoTime % 60).toString().padStart(2, '0')}</span>
                      <span>5:00</span>
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
                      <span className="break-all">{youtubeUrl ? youtubeUrl : 'YouTube Video Title'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Duration: 5:00</span>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {showNotes && (
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
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
                    
                    {editingNoteId === 'video' && (
                      <div className="mb-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <textarea
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Add a note about this video..."
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm resize-none"
                          rows={2}
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
                    
                    <div className="space-y-2 overflow-y-auto max-h-32 sm:max-h-48 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  Transcript
                </h3>

                {/* Transcript Content */}
                <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                  {transcriptSections.map((section) => (
                    <div key={section.id} className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                        <button
                          onClick={() => handleJumpToTime(section.startTime)}
                          className="text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors hover:underline"
                        >
                          {section.timestamp}
                        </button>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleCopyToClipboard(section.text, section.id)}
                            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                              copiedSectionId === section.id
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 scale-110'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                            }`}
                            title="Copy to clipboard"
                          >
                            {copiedSectionId === section.id ? (
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleAddNote(section.id)}
                            className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 transition-all duration-300"
                            title="Add note"
                          >
                            <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{section.text}</p>
                      
                      {/* Note Input for this section */}
                      {editingNoteId === section.id && (
                        <div className="mt-3 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                          <textarea
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            placeholder="Add a note about this section..."
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm resize-none"
                            rows={2}
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
                      {getSectionNotes(section.id).map(note => (
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  Insights & Actions
                </h3>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                  {/* Key Highlights */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
                      Key Highlights
                    </h4>
                    <div className="space-y-1">
                      {[
                        'Introduction to AI and ML concepts',
                        'Fundamentals of machine learning',
                        'Neural networks and deep learning',
                        'Pattern recognition in data',
                        'Traditional vs. ML programming approaches'
                      ].map((highlight, index) => (
                        <div key={index} className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">{highlight}</p>
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
                      {[
                        '"Machine learning enables computers to learn patterns from data without explicit programming."',
                        '"From neural networks to deep learning algorithms, we will cover everything you need to know."',
                        '"Let us begin with the basics of machine learning and how it differs from traditional programming."'
                      ].map((quote, index) => (
                        <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 italic">{quote}</p>
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
                      {[
                        'Review fundamental ML concepts',
                        'Practice with neural network examples',
                        'Compare traditional vs. ML approaches',
                        'Explore pattern recognition techniques'
                      ].map((action, index) => (
                        <div key={index} className="p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                          <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-200">{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
