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
import { 
  EXPORT_FORMATS, 
  generateTXT, 
  generateDOCX, 
  generateSRT, 
  generateVTT, 
  generateMP3, 
  generateMP4, 
  downloadFile,
  type TranscriptionData as ExportTranscriptionData
} from '@/lib/exportFormats'
import { 
  canExportFormat, 
  getUpgradeMessage, 
  getCurrentUserTier,
  type SubscriptionTier 
} from '@/lib/subscription'

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
  isCached?: boolean
  cachedAt?: number
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
  const [exportingFormat, setExportingFormat] = useState<string | null>(null)
  const [currentTier] = useState<SubscriptionTier>(getCurrentUserTier())

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

  const getCachedTranscription = (url: string) => {
    try {
      const cached = localStorage.getItem(`transcription_${url}`)
      if (cached) {
        const data = JSON.parse(cached)
        // Check if cache is less than 24 hours old
        const cacheAge = Date.now() - data.cachedAt
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours
        if (cacheAge < maxAge) {
          return data
        } else {
          // Remove expired cache
          localStorage.removeItem(`transcription_${url}`)
        }
      }
      return null
    } catch (error) {
      console.error('Error reading cached transcription:', error)
      return null
    }
  }

  const cacheTranscription = (url: string, data: TranscriptionData) => {
    try {
      const cacheData = {
        ...data,
        cachedAt: Date.now(),
        isCached: true
      }
      localStorage.setItem(`transcription_${url}`, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error caching transcription:', error)
    }
  }

  const fetchTranscriptionData = async (url: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // First, check if we have a stored result from the main page
      const storedResult = localStorage.getItem('transcriptionResult')
      if (storedResult) {
        try {
          const parsedResult = JSON.parse(storedResult)
          // Check if this stored result is for the current URL
          if (parsedResult.youtube_url === url) {
            console.log('📚 Using stored transcription result for:', url)
            setTranscriptionData(parsedResult)
            // Cache it for future use
            cacheTranscription(url, parsedResult)
            // Clear the stored result to avoid confusion
            localStorage.removeItem('transcriptionResult')
            setIsLoading(false)
            return
          }
        } catch (parseError) {
          console.error('Error parsing stored result:', parseError)
        }
      }
      
      // Second, check if we have a cached version
      const cachedData = getCachedTranscription(url)
      if (cachedData) {
        console.log('📚 Using cached transcription for:', url)
        setTranscriptionData(cachedData)
        setIsLoading(false)
        return
      }
      
      // If no stored or cached result, call the API
      console.log('🔄 Fetching new transcription for:', url)
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeUrl: url }),
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Cache the new transcription
        cacheTranscription(url, data)
        setTranscriptionData(data)
      } else {
        throw new Error(data.error || 'Transcription failed')
      }
    } catch (err) {
      console.error('Failed to fetch transcription data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load transcription data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    // Convert milliseconds to seconds if needed (AssemblyAI sometimes returns milliseconds)
    const timeInSeconds = seconds > 1000 ? seconds / 1000 : seconds
    
    const mins = Math.floor(timeInSeconds / 60)
    const secs = Math.floor(timeInSeconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const groupWordsIntoSentences = (words: Array<{ text: string; start: number; end: number; confidence: number; speaker: string }>) => {
    const sentences = []
    let currentSentence = []
    let currentStart = 0
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      
      if (currentSentence.length === 0) {
        currentStart = word.start
      }
      
      currentSentence.push(word)
      
      // Check if this word ends a sentence (ends with punctuation or is the last word)
      const isEndOfSentence = word.text.match(/[.!?]$/) || i === words.length - 1
      
      if (isEndOfSentence && currentSentence.length > 0) {
        sentences.push({
          text: currentSentence.map(w => w.text).join(' '),
          start: currentStart,
          end: word.end,
          confidence: currentSentence.reduce((sum, w) => sum + w.confidence, 0) / currentSentence.length,
          speaker: word.speaker
        })
        currentSentence = []
      }
    }
    
    // If there are remaining words without punctuation, add them as a sentence
    if (currentSentence.length > 0) {
      sentences.push({
        text: currentSentence.map(w => w.text).join(' '),
        start: currentStart,
        end: currentSentence[currentSentence.length - 1].end,
        confidence: currentSentence.reduce((sum, w) => sum + w.confidence, 0) / currentSentence.length,
        speaker: currentSentence[0].speaker
      })
    }
    
    return sentences
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
    // Convert milliseconds to seconds if needed
    const timeInSeconds = startTime > 1000 ? startTime / 1000 : startTime
    
    setCurrentVideoTime(timeInSeconds)
    
    // Send message to YouTube iframe to seek to specific time
    const iframe = document.querySelector('iframe[src*="youtube.com"]') as HTMLIFrameElement
    if (iframe && iframe.contentWindow) {
      const message = JSON.stringify({
        event: 'command',
        func: 'seekTo',
        args: [timeInSeconds, true]
      })
      iframe.contentWindow.postMessage(message, '*')
    }
    
    console.log(`Jumping to ${timeInSeconds} seconds`)
  }

  const getSectionNotes = (sectionId: string) => {
    return notes.filter(note => note.sectionId === sectionId)
  }

  const handleExport = async (format: string, data: TranscriptionData) => {
    if (!data) return
    
    setExportingFormat(format)
    
    try {
      // Get video title for filename
      const videoId = getYouTubeVideoId(data.youtube_url)
      const videoTitle = videoId ? `transcript_${videoId}` : 'transcript'
      
      let content: string | Blob
      let filename: string
      let mimeType: string
      
      switch (format) {
        case 'TXT':
          content = generateTXT(data as ExportTranscriptionData)
          filename = `${videoTitle}.txt`
          mimeType = 'text/plain'
          break
        case 'DOCX':
          content = generateDOCX(data as ExportTranscriptionData)
          filename = `${videoTitle}.rtf` // Rich Text Format that Word can open
          mimeType = 'application/rtf'
          break
        case 'SRT':
          content = generateSRT(data as ExportTranscriptionData)
          filename = `${videoTitle}.srt`
          mimeType = 'text/plain'
          break
        case 'VTT':
          content = generateVTT(data as ExportTranscriptionData)
          filename = `${videoTitle}.vtt`
          mimeType = 'text/vtt'
          break
        case 'MP3':
          content = await generateMP3(data as ExportTranscriptionData)
          filename = `${videoTitle}.mp3`
          mimeType = 'audio/mpeg'
          break
        case 'MP4':
          content = await generateMP4(data as ExportTranscriptionData)
          filename = `${videoTitle}.mp4`
          mimeType = 'video/mp4'
          break
        default:
          console.error('Unsupported export format:', format)
          return
      }
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      
      downloadFile(content, filename, mimeType)
      
      // Show success feedback
      console.log(`✅ Successfully exported ${format} file: ${filename}`)
      
    } catch (error) {
      console.error(`❌ Failed to export ${format}:`, error)
      alert(`Failed to export ${format} file. Please try again.`)
    } finally {
      setExportingFormat(null)
    }
  }

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    return null;
  };

  const getAllCachedTranscriptions = () => {
    try {
      const transcriptions = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('transcription_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}')
            if (data.cachedAt) {
              transcriptions.push({
                url: key.replace('transcription_', ''),
                title: data.youtube_url || 'Unknown Video',
                cachedAt: data.cachedAt,
                duration: data.audio_duration || 0
              })
            }
          } catch (e) {
            console.error('Error parsing cached transcription:', e)
          }
        }
      }
      // Sort by most recent first
      return transcriptions.sort((a, b) => b.cachedAt - a.cachedAt)
    } catch (error) {
      console.error('Error getting cached transcriptions:', error)
      return []
    }
  }

  const clearCache = () => {
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('transcription_')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      console.log('🗑️ Cleared transcription cache')
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
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
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(youtubeUrl)}?enablejsapi=1&origin=${window.location.origin}`}
                    title="YouTube video player"
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Video Info */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Video Information</h4>
                    <div className="flex gap-2">
                      {searchParams.get('fromHistory') === 'true' && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs rounded-full">
                          From History
                        </span>
                      )}
                      {transcriptionData.isCached && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          From Cache
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Youtube className="w-3 h-3 sm:h-4 flex-shrink-0" />
                      <span className="break-all truncate">{youtubeUrl || 'YouTube Video Title'}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 sm:h-4 flex-shrink-0" />
                        <span>Duration: {formatDuration(transcriptionData.audio_duration)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Language: {transcriptionData.language_code.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Notes Section */}
                {showNotes && (
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 sm:h-4 text-primary-600" />
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
                  {groupWordsIntoSentences(transcriptionData.words).map((sentence, index) => (
                    <div key={index} className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                        <button
                          onClick={() => jumpToTime(sentence.start)}
                          className="text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors hover:underline"
                        >
                          {formatTime(sentence.start)}
                        </button>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleCopyToClipboard(sentence.text, `sentence-${index}`)}
                            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                              copiedSectionId === `sentence-${index}`
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 scale-110'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                            }`}
                            title="Copy to clipboard"
                          >
                            {copiedSectionId === `sentence-${index}` ? (
                              <Check className="w-3 h-3 sm:h-4" />
                            ) : (
                              <Copy className="w-3 h-3 sm:h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleAddNote(`sentence-${index}`)}
                            className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 transition-all duration-300"
                            title="Add note"
                          >
                            <Edit3 className="w-3 h-3 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{sentence.text}</p>
                      
                      {/* Note Input for this section */}
                      {editingNoteId === `sentence-${index}` && (
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
                      {getSectionNotes(`sentence-${index}`).map(note => (
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
                    {EXPORT_FORMATS.map((format) => {
                      const isExporting = exportingFormat === format.name
                      const canExport = canExportFormat(currentTier, format.name)
                      const upgradeMessage = getUpgradeMessage(currentTier, format.name)
                      
                      return (
                        <button
                          key={format.name}
                          onClick={() => canExport ? handleExport(format.name, transcriptionData) : alert(upgradeMessage)}
                          disabled={isExporting}
                          className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                            isExporting
                              ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 cursor-not-allowed'
                              : canExport
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                          }`}
                          title={canExport ? format.description : upgradeMessage}
                        >
                          {isExporting ? (
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin" />
                          ) : canExport ? (
                            <Download className="w-3 h-3 sm:h-4" />
                          ) : (
                            <div className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500">🔒</div>
                          )}
                          {isExporting ? 'Exporting...' : format.name}
                        </button>
                      )
                    })}
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
                      <MessageSquare className="w-3 h-3 sm:w-4 text-primary-600" />
                      Key Highlights
                    </h4>
                    <div className="space-y-1">
                      {transcriptionData.highlights && transcriptionData.highlights.length > 0 ? (
                        transcriptionData.highlights.map((highlight, index) => (
                          <div key={index} className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">{highlight.text}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">No highlights available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Quotes */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <MessageSquare className="w-3 h-3 sm:w-4 text-primary-600" />
                      Key Quotes
                    </h4>
                    <div className="space-y-2">
                      {transcriptionData.sentiment && transcriptionData.sentiment.length > 0 ? (
                        transcriptionData.sentiment.slice(0, 3).map((sentiment, index) => (
                          <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 italic">"{sentiment.text}"</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">No quotes available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Items */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <MessageSquare className="w-3 h-3 sm:w-4 text-primary-600" />
                      Action Items
                    </h4>
                    <div className="space-y-1">
                      {transcriptionData.chapters && transcriptionData.chapters.length > 0 ? (
                        transcriptionData.chapters.map((chapter, index) => (
                          <div key={index} className="p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-200">{chapter.headline}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">No action items available</p>
                        </div>
                      )}
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
