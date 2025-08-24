'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import TranscriptionHeader from '../../components/TranscriptionHeader'
import { Copy, Check, Plus, X, Edit3, Trash2, Star, TrendingUp, MessageCircle, Clock, Download, FileText } from 'lucide-react'

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

export default function TranscriptionResults() {
  const searchParams = useSearchParams()
  const youtubeUrl = searchParams.get('url')
  const [transcriptionData, setTranscriptionData] = useState<TranscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null)
  const [notes, setNotes] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (youtubeUrl) {
      fetchTranscriptionData()
    }
  }, [youtubeUrl])

  const fetchTranscriptionData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // For now, we'll use mock data since the API is set up but we need to test the flow
      // In production, this would call your actual transcription API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      // Mock data structure matching AssemblyAI response
      const mockData: TranscriptionData = {
        transcript: `This is a sample transcription of a YouTube video about artificial intelligence and machine learning. The video discusses various topics including neural networks, deep learning algorithms, and their applications in modern technology.

The speaker explains how machine learning models are trained using large datasets and how they can recognize patterns in data. They also discuss the challenges of implementing AI systems in production environments and the importance of data quality.

Throughout the video, several key concepts are covered such as supervised learning, unsupervised learning, and reinforcement learning. The speaker provides practical examples of each approach and discusses their respective advantages and limitations.`,
        confidence: 0.95,
        audio_duration: 1800, // 30 minutes in seconds
        words: [
          { text: "This", start: 0, end: 0.5, confidence: 0.99, speaker: "A" },
          { text: "is", start: 0.5, end: 1.0, confidence: 0.98, speaker: "A" },
          { text: "a", start: 1.0, end: 1.2, confidence: 0.97, speaker: "A" },
          { text: "sample", start: 1.2, end: 2.0, confidence: 0.96, speaker: "A" },
          { text: "transcription", start: 2.0, end: 3.5, confidence: 0.95, speaker: "A" },
        ],
        highlights: [
          { count: 5, rank: 0.95, text: "artificial intelligence", timestamps: [{ start: 10, end: 15 }] },
          { count: 4, rank: 0.92, text: "machine learning", timestamps: [{ start: 25, end: 30 }] },
          { count: 3, rank: 0.88, text: "neural networks", timestamps: [{ start: 45, end: 50 }] },
          { count: 3, rank: 0.85, text: "deep learning", timestamps: [{ start: 60, end: 65 }] },
        ],
        sentiment: [
          { text: "This is exciting technology", start: 20, end: 25, sentiment: "positive", confidence: 0.9 },
          { text: "Challenges in implementation", start: 80, end: 85, sentiment: "neutral", confidence: 0.8 },
          { text: "Great potential for future", start: 120, end: 125, sentiment: "positive", confidence: 0.95 },
        ],
        chapters: [
          { summary: "Introduction to AI and ML", headline: "Getting Started", start: 0, end: 300 },
          { summary: "Deep dive into neural networks", headline: "Neural Networks", start: 300, end: 600 },
          { summary: "Practical applications and challenges", headline: "Real World Applications", start: 600, end: 900 },
          { summary: "Future trends and conclusion", headline: "Looking Ahead", start: 900, end: 1200 },
        ],
        entities: [
          { text: "Python", entity_type: "technology", start: 100, end: 105 },
          { text: "TensorFlow", entity_type: "technology", start: 150, end: 155 },
          { text: "Google", entity_type: "organization", start: 200, end: 205 },
        ],
        speaker_labels: [
          { speaker: "A", start: 0, end: 1800 },
        ],
        language_code: "en",
        youtube_url: youtubeUrl || "",
      }
      
      setTranscriptionData(mockData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transcription data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = (sectionId: string) => {
    setEditingNoteId(sectionId)
    setNoteInput(notes[sectionId] || '')
  }

  const handleSaveNote = (sectionId: string) => {
    if (noteInput.trim()) {
      setNotes(prev => ({ ...prev, [sectionId]: noteInput.trim() }))
    }
    setEditingNoteId(null)
    setNoteInput('')
  }

  const handleCancelNote = () => {
    setEditingNoteId(null)
    setNoteInput('')
  }

  const handleDeleteNote = (sectionId: string) => {
    setNotes(prev => {
      const newNotes = { ...prev }
      delete newNotes[sectionId]
      return newNotes
    })
  }

  const handleCopyToClipboard = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSectionId(sectionId)
      setTimeout(() => setCopiedSectionId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const jumpToTime = (seconds: number) => {
    // This would control the video player
    console.log(`Jumping to ${seconds} seconds`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <TranscriptionHeader />
        <main className="pt-20">
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Processing Transcription</h2>
              <p className="text-gray-600 dark:text-gray-300">This may take a few minutes...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !transcriptionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <TranscriptionHeader />
        <main className="pt-20">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <TranscriptionHeader />
      <main className="pt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)]">
            {/* Video Player Section */}
            <div className="lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 h-full">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                  Video Player
                </h3>
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8 text-primary-600 dark:text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" fill="currentColor"/>
                        <path d="m10 15 5-3-5-3z" fill="white"/>
                      </svg>
                    </div>
                    <p className="text-sm">YouTube Video</p>
                    <p className="text-xs">URL: {youtubeUrl}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{formatTime(transcriptionData.audio_duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span>{(transcriptionData.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Language:</span>
                    <span className="uppercase">{transcriptionData.language_code}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript Section */}
            <div className="lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 h-full">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                  Transcript
                </h3>
                <div className="h-[calc(100%-60px)] overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    {transcriptionData.words.map((word, index) => (
                      <div key={index} className="group relative p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs text-primary-600 dark:text-primary-400 font-mono">
                            {formatTime(word.start)}
                          </span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => handleCopyToClipboard(word.text, `word-${index}`)}
                              className="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500 transition-colors duration-200"
                              title="Copy to clipboard"
                            >
                              {copiedSectionId === `word-${index}` ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleAddNote(`word-${index}`)}
                              className="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500 transition-colors duration-200"
                              title="Add note"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => jumpToTime(word.start)}
                              className="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500 transition-colors duration-200"
                              title="Jump to time"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                          {word.text}
                        </p>
                        
                        {/* Note input */}
                        {editingNoteId === `word-${index}` && (
                          <div className="mt-3 space-y-2">
                            <textarea
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="Add a note..."
                              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white resize-none"
                              rows={2}
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveNote(`word-${index}`)}
                                className="px-3 py-1 text-xs bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelNote}
                                className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Display note */}
                        {notes[`word-${index}`] && (
                          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                            <div className="flex items-start justify-between">
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                {notes[`word-${index}`]}
                              </p>
                              <button
                                onClick={() => handleDeleteNote(`word-${index}`)}
                                className="ml-2 p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200 transition-colors duration-200"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Insights & Actions Section */}
            <div className="lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 h-full">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                  Insights & Actions
                </h3>
                <div className="h-[calc(100%-60px)] overflow-y-auto custom-scrollbar space-y-6">
                  {/* Highlights */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Key Highlights
                    </h4>
                    <div className="space-y-2">
                      {transcriptionData.highlights.map((highlight, index) => (
                        <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            {highlight.text}
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Mentioned {highlight.count} times • Rank: {highlight.rank.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sentiment Analysis */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Sentiment Analysis</h4>
                    <div className="space-y-2">
                      {transcriptionData.sentiment.map((item, index) => (
                        <div key={index} className={`p-2 rounded-md ${
                          item.sentiment === 'positive' ? 'bg-green-50 dark:bg-green-900/20' :
                          item.sentiment === 'negative' ? 'bg-red-50 dark:bg-red-900/20' :
                          'bg-gray-50 dark:bg-gray-700/50'
                        }`}>
                          <p className="text-sm text-gray-900 dark:text-white">{item.text}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              item.sentiment === 'positive' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' :
                              item.sentiment === 'negative' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                              'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {item.sentiment}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(item.start)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chapters */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Chapters</h4>
                    <div className="space-y-2">
                      {transcriptionData.chapters.map((chapter, index) => (
                        <div key={index} className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            {chapter.headline}
                          </p>
                          <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">
                            {chapter.summary}
                          </p>
                          <p className="text-xs text-purple-600 dark:text-purple-400">
                            {formatTime(chapter.start)} - {formatTime(chapter.end)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Export Actions */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Export Options</h4>
                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors duration-200">
                        <Download className="w-4 h-4" />
                        Download Transcript (TXT)
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200">
                        <FileText className="w-4 h-4" />
                        Export as SRT
                      </button>
                    </div>
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
