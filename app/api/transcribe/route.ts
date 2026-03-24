import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import axios from 'axios'
import fs from 'fs-extra'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { updateProgress, setCompleted } from '../../../lib/progress'
import connectDB from '@/lib/mongodb'
import { Transcription, User, UsageTracking, ProcessedVideos } from '@/models'
import { authOptions } from '@/lib/auth-options'
import { requireSubscription } from '@/lib/subscriptionCheck'
import { AudioStreamInfo, buildStreamApiSources, getStreamApiEndpoint, normalizeAudioStreams } from '@/lib/streamProviders'

const execAsync = promisify(exec)
const YTDLP_BINARY = path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp')
const YTDLP_JS_RUNTIMES = process.env.YTDLP_JS_RUNTIMES || process.env.runtimes || 'node'

type CaptionTrack = {
  baseUrl: string
  languageCode: string
}

type CaptionItem = {
  text: string
  duration: number
  offset: number
  lang: string
}

if (!process.env.ASSEMBLYAI_API_KEY) {
  throw new Error('ASSEMBLYAI_API_KEY environment variable is not set')
}
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY
const baseUrl = 'https://api.assemblyai.com'

const headers = {
  authorization: ASSEMBLYAI_API_KEY,
}

function getErrorText(error: unknown): string {
  if (!error) {
    return 'Unknown error'
  }

  if (typeof error === 'string') {
    return error
  }

  const anyError = error as any
  return [anyError.message, anyError.stderr, anyError.stdout].filter(Boolean).join('\n') || String(error)
}

function buildDirectAssemblyAiErrorMessage(errorText: string): string {
  const normalized = errorText.toLowerCase()

  if (
    normalized.includes('file does not appear to contain audio') ||
    normalized.includes('file type is text/html') ||
    normalized.includes('transcoding failed')
  ) {
    return 'AssemblyAI fetched the YouTube page successfully, but it received HTML instead of an audio stream. A standard YouTube watch URL is not being treated as a direct audio source for this request.'
  }

  return `AssemblyAI could not transcribe audio directly from this YouTube URL. ${errorText}`
}

function buildYtDlpCommand(youtubeUrl: string, audioFile: string, playerClient: string): string {
  return [
    `"${YTDLP_BINARY}"`,
    '--no-playlist',
    '--no-warnings',
    '--retries 2',
    '--fragment-retries 2',
    '--socket-timeout 30',
    `--js-runtimes ${YTDLP_JS_RUNTIMES}`,
    `--extractor-args "youtube:player_client=${playerClient}"`,
    '-f "bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio"',
    `-o "${audioFile}"`,
    `"${youtubeUrl}"`,
  ].join(' ')
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

function parseTranscriptXml(xml: string, lang: string): CaptionItem[] {
  const items: CaptionItem[] = []
  const srv3Pattern = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g
  let match: RegExpExecArray | null = null

  while ((match = srv3Pattern.exec(xml)) !== null) {
    const offset = parseInt(match[1], 10)
    const duration = parseInt(match[2], 10)
    const inner = match[3]
    const text = decodeEntities(inner.replace(/<[^>]+>/g, '').trim())

    if (text) {
      items.push({ text, duration, offset, lang })
    }
  }

  if (items.length > 0) {
    return items
  }

  const classicPattern = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g
  while ((match = classicPattern.exec(xml)) !== null) {
    items.push({
      text: decodeEntities(match[3]),
      duration: Math.round(parseFloat(match[2]) * 1000),
      offset: Math.round(parseFloat(match[1]) * 1000),
      lang,
    })
  }

  return items
}

function parseInlineJson(html: string, variableName: string) {
  const marker = `var ${variableName} = `
  const startIndex = html.indexOf(marker)
  if (startIndex === -1) {
    return null
  }

  const jsonStart = startIndex + marker.length
  let depth = 0

  for (let index = jsonStart; index < html.length; index++) {
    if (html[index] === '{') {
      depth += 1
    } else if (html[index] === '}') {
      depth -= 1
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(jsonStart, index + 1))
        } catch {
          return null
        }
      }
    }
  }

  return null
}

async function fetchCaptionTrack(videoId: string, youtubeUrl: string): Promise<CaptionItem[]> {
  const playerUrl = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false'
  const androidUserAgent = 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)'

  try {
    const playerResponse = await fetch(playerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': androidUserAgent,
      },
      body: JSON.stringify({
        context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
        videoId,
      }),
    })

    const playerJson = await playerResponse.json()
    const innerTubeTracks = playerJson?.captions?.playerCaptionsTracklistRenderer?.captionTracks as CaptionTrack[] | undefined
    if (Array.isArray(innerTubeTracks) && innerTubeTracks.length > 0) {
      const captionResponse = await fetch(innerTubeTracks[0].baseUrl, { headers: { 'User-Agent': androidUserAgent } })
      if (captionResponse.ok) {
        const xml = await captionResponse.text()
        const items = parseTranscriptXml(xml, innerTubeTracks[0].languageCode || 'en')
        if (items.length > 0) {
          return items
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ InnerTube caption lookup failed:', getErrorText(error))
  }

  const webUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36'
  const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { 'User-Agent': webUserAgent },
  })
  const html = await pageResponse.text()

  if (!html.includes('"playabilityStatus":')) {
    throw new Error(`Video page unavailable for caption fallback: ${youtubeUrl}`)
  }

  const playerData = parseInlineJson(html, 'ytInitialPlayerResponse')
  const pageTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks as CaptionTrack[] | undefined
  if (!Array.isArray(pageTracks) || pageTracks.length === 0) {
    throw new Error('No captions available for this video')
  }

  const captionResponse = await fetch(pageTracks[0].baseUrl, { headers: { 'User-Agent': webUserAgent } })
  if (!captionResponse.ok) {
    throw new Error(`Caption track request failed with status ${captionResponse.status}`)
  }

  const xml = await captionResponse.text()
  return parseTranscriptXml(xml, pageTracks[0].languageCode || 'en')
}

async function requestAssemblyAiTranscript(audioUrl: string) {
  console.log('🎯 Requesting transcription...')
  updateProgress('🎯 Starting AI transcription...')

  const transcriptData = {
    audio_url: audioUrl,
    speech_model: 'universal',
    language_code: 'en',
    punctuate: true,
    format_text: true,
    speaker_labels: true,
    auto_highlights: true,
    sentiment_analysis: true,
    auto_chapters: true,
    entity_detection: true,
  }

  const transcriptResponse = await axios.post(`${baseUrl}/v2/transcript`, transcriptData, { headers })
  const transcriptId = transcriptResponse.data.id

  console.log('⏳ Polling for completion...')
  updateProgress('⏳ Processing with AI...')

  let maxAttempts = 60
  let attempts = 0

  while (attempts < maxAttempts) {
    const pollingResponse = await axios.get(`${baseUrl}/v2/transcript/${transcriptId}`, { headers })
    const transcriptionResult = pollingResponse.data

    if (transcriptionResult.status === 'completed') {
      console.log('✅ Transcription completed!')
      updateProgress('✨ Transcription completed!')
      setCompleted()
      return transcriptionResult
    }

    if (transcriptionResult.status === 'error') {
      throw new Error(`Transcription failed: ${transcriptionResult.error}`)
    }

    await new Promise(resolve => setTimeout(resolve, 5000))
    attempts++
  }

  throw new Error('Transcription timeout - video may be too long')
}

// Mock data for testing without using AssemblyAI credits
const mockTranscriptionData = {
  transcript: "Hello everyone, welcome to this amazing video about artificial intelligence and machine learning. Today we're going to explore the fascinating world of AI and how it's transforming our daily lives. From virtual assistants to autonomous vehicles, AI is everywhere around us. Let me share some incredible insights about the future of technology and how it will shape our world in the coming years. AI is transforming various industries and creating new opportunities for innovation. The key question is: How will artificial intelligence change the way we work and live? We need to understand that this technology requires careful consideration and strategic planning. What are the most important factors to consider when implementing AI solutions? First, you must identify your specific use cases. Second, ensure you have quality data. Third, start with pilot projects before scaling up. Remember, AI is not a magic solution - it's a powerful tool that requires expertise and thoughtful strategy.",
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
    { 
      count: 1, 
      rank: 1, 
      text: "Today we're going to explore the fascinating world of AI and how it's transforming our daily lives.", 
      timestamps: [{ start: 5.5, end: 8.2 }] 
    },
    { 
      count: 1, 
      rank: 2, 
      text: "From virtual assistants to autonomous vehicles, AI is everywhere around us.", 
      timestamps: [{ start: 8.5, end: 11.2 }] 
    },
    { 
      count: 1, 
      rank: 3, 
      text: "Let me share some incredible insights about the future of technology and how it will shape our world.", 
      timestamps: [{ start: 12.0, end: 15.8 }] 
    },
    { 
      count: 1, 
      rank: 4, 
      text: "AI is transforming various industries and creating new opportunities for innovation.", 
      timestamps: [{ start: 16.0, end: 19.5 }] 
    },
    { 
      count: 1, 
      rank: 5, 
      text: "The key question is: How will artificial intelligence change the way we work and live?", 
      timestamps: [{ start: 20.0, end: 23.8 }] 
    }
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
  youtube_url: ""
}

// Simple in-memory cache for server-side duplicate prevention
const transcriptionCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Track ongoing transcriptions to prevent duplicates
const ongoingTranscriptions = new Map<string, Promise<any>>()

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl } = await request.json()
    
    if (!youtubeUrl) {
      console.error('❌ Missing youtubeUrl in request body')
      return NextResponse.json({ error: 'Missing youtubeUrl parameter' }, { status: 400 })
    }
    
    // Get authenticated user from session
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      console.error('❌ No authenticated user found')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // Check if user has active subscription
    try {
      const user = await requireSubscription()
      if (!user) {
        console.error('❌ User does not have active subscription:', session.user.email)
        return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
      }
      console.log('✅ Subscription check passed for user:', user.email)
    } catch (subscriptionError) {
      console.error('❌ Subscription check failed:', subscriptionError)
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
    }
    
    const userId = session.user.id
    console.log('📝 Received transcription request for:', youtubeUrl, 'from user:', userId)
    
    // Check if this transcription is already in progress
    const transcriptionKey = `${userId}_${youtubeUrl}`
    if (ongoingTranscriptions.has(transcriptionKey)) {
      console.log('🔄 Transcription already in progress for:', youtubeUrl)
      return NextResponse.json({ 
        success: false, 
        error: 'ALREADY_PROCESSING',
        message: 'This video is already being transcribed. Please wait for completion.'
      }, { status: 409 })
    }
    
    // Check if it's a test URL (for development/testing)
    const isTestUrl = youtubeUrl.includes('test') || youtubeUrl.includes('example') || youtubeUrl.includes('demo')
    
    if (isTestUrl) {
      // Return mock data for testing
      console.log('🧪 Test mode: Returning mock data for:', youtubeUrl)
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return NextResponse.json({
        success: true,
        ...mockTranscriptionData,
        youtube_url: youtubeUrl
      })
    }

         // Check for duplicate URL in database before processing
     try {
       await connectDB()
       
       // Extract video ID from URL for duplicate checking
       const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
       const videoId = videoIdMatch ? videoIdMatch[1] : 'unknown'
       
       // Clean up any failed transcriptions for this video (to prevent accumulation of failed attempts)
       try {
         const failedTranscriptions = await Transcription.find({
           userId: userId,
           videoId: videoId,
           status: 'failed'
         })
         
         if (failedTranscriptions.length > 0) {
           console.log(`🧹 Cleaning up ${failedTranscriptions.length} failed transcriptions for video: ${videoId}`)
           await Transcription.deleteMany({
             userId: userId,
             videoId: videoId,
             status: 'failed'
           })
         }
       } catch (cleanupError) {
         console.warn('⚠️ Failed to cleanup failed transcriptions:', cleanupError)
       }
       
       // Check if this user has already processed this video (even if deleted)
       console.log('🔍 Checking for processed video - userId:', userId, 'videoId:', videoId)
       
       // Debug: Show all ProcessedVideos records for this user
       const allUserRecords = await ProcessedVideos.find({ userId: userId })
       console.log('📋 All ProcessedVideos records for user:', allUserRecords.map(r => ({ videoId: r.videoId, youtubeUrl: r.youtubeUrl })))
       
       const processedVideo = await ProcessedVideos.findOne({
         userId: userId,
         videoId: videoId
       })
       
       if (processedVideo) {
         console.log('🚫 Video already processed by user:', userId, 'Video ID:', videoId, 'URL:', youtubeUrl)
         console.log('📋 ProcessedVideos record:', processedVideo)
         
         return NextResponse.json({
           success: false,
           error: 'DUPLICATE_VIDEO',
           message: 'Video already transcribed! You can view/edit the existing transcription.',
           existingTranscriptionId: processedVideo.transcriptionId
         }, { status: 409 }) // 409 Conflict
       }
       
     } catch (dbError: any) {
       console.error('❌ Database error during duplicate check:', dbError)
       // Continue with transcription if duplicate check fails
     }

    // Create a promise for this transcription and store it
    const transcriptionPromise = processTranscription(youtubeUrl, userId)
    ongoingTranscriptions.set(transcriptionKey, transcriptionPromise)
    
    try {
      const result = await transcriptionPromise
      return result
    } finally {
      // Always clean up the ongoing transcription
      ongoingTranscriptions.delete(transcriptionKey)
    }
    
  } catch (error) {
    console.error('❌ Request parsing error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Separate function to handle the actual transcription processing
async function processTranscription(youtubeUrl: string, userId: string) {
  const startTime = Date.now() // Track processing time for credit usage

  console.log('🚀 Starting transcription for:', youtubeUrl)
  updateProgress('🚀 Starting transcription...')

  const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  const videoId = videoIdMatch ? videoIdMatch[1] : 'unknown'

  let videoTitle = `Video ${videoId}` // Fallback title
  try {
    console.log('📺 Fetching video title for:', videoId)
    const titleResponse = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`)
    if (titleResponse.data && titleResponse.data.title) {
      videoTitle = titleResponse.data.title
      console.log('✅ Video title fetched:', videoTitle)
    }
  } catch (titleError: any) {
    console.warn('⚠️ Could not fetch video title, using fallback:', titleError.message)
  }

  let transcriptionResult: any | null = null

  try {
    updateProgress('🔗 Sending YouTube URL to AssemblyAI...')
    transcriptionResult = await requestAssemblyAiTranscript(youtubeUrl)
    console.log('✅ AssemblyAI completed transcription directly from YouTube URL')
  } catch (directSourceError) {
    const errorText = getErrorText(directSourceError)
    console.error('❌ Direct AssemblyAI transcription failed:', errorText)
    const userFacingError = buildDirectAssemblyAiErrorMessage(errorText)

    try {
      await connectDB()
      const transcription = new Transcription({
        userId: userId,
        youtubeUrl: youtubeUrl,
        videoTitle: videoTitle,
        videoId: videoId,
        transcript: '',
        confidence: 0,
        audioDuration: 0,
        status: 'failed',
        errorMessage: `${userFacingError}\n\nRaw error: ${errorText}`.slice(0, 2000)
      })
      await transcription.save()
    } catch (saveError) {
      console.warn('⚠️ Failed to save failed direct AssemblyAI transcription:', saveError)
    }

    return NextResponse.json({
      success: false,
      error: userFacingError,
      details: errorText,
      status: 'failed'
    }, { status: 502 })
  }

  console.log('📊 Full transcription result:', JSON.stringify(transcriptionResult, null, 2))
  console.log('🔍 Highlights result:', transcriptionResult.auto_highlights_result)
  console.log('🔍 Sentiment result:', transcriptionResult.sentiment_analysis)
  console.log('🔍 Chapters result:', transcriptionResult.auto_chapters_result)

  const generateFallbackData = (text: string) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50)

    const generateHighlights = () => {
      const highlights: Array<{
        count: number
        rank: number
        text: string
        timestamps: Array<{ start: number; end: number }>
      }> = []

      const questionSentences = sentences.filter(s =>
        s.includes('?') ||
        s.toLowerCase().includes('how') ||
        s.toLowerCase().includes('what') ||
        s.toLowerCase().includes('why') ||
        s.toLowerCase().includes('when') ||
        s.toLowerCase().includes('where')
      )

      const numberSentences = sentences.filter(s => /\d+/.test(s) && s.length > 20)

      const actionSentences = sentences.filter(s =>
        s.toLowerCase().includes('should') ||
        s.toLowerCase().includes('must') ||
        s.toLowerCase().includes('need to') ||
        s.toLowerCase().includes('important') ||
        s.toLowerCase().includes('key') ||
        s.toLowerCase().includes('essential')
      )

      questionSentences.slice(0, 2).forEach((sentence, i) => {
        highlights.push({
          count: 1,
          rank: i + 1,
          text: sentence.trim().substring(0, 100) + (sentence.length > 100 ? '...' : ''),
          timestamps: [{ start: i * 30, end: (i + 1) * 30 }]
        })
      })

      numberSentences.slice(0, 2).forEach((sentence, i) => {
        highlights.push({
          count: 1,
          rank: highlights.length + 1,
          text: sentence.trim().substring(0, 100) + (sentence.length > 100 ? '...' : ''),
          timestamps: [{ start: (highlights.length + i) * 30, end: (highlights.length + i + 1) * 30 }]
        })
      })

      actionSentences.slice(0, 2).forEach((sentence, i) => {
        highlights.push({
          count: 1,
          rank: highlights.length + 1,
          text: sentence.trim().substring(0, 100) + (sentence.length > 100 ? '...' : ''),
          timestamps: [{ start: (highlights.length + i) * 30, end: (highlights.length + i + 1) * 30 }]
        })
      })

      if (highlights.length < 5) {
        const remainingSentences = sentences
          .filter(s => !highlights.some(h => h.text.includes(s.substring(0, 20))))
          .slice(0, 5 - highlights.length)

        remainingSentences.forEach((sentence, i) => {
          highlights.push({
            count: 1,
            rank: highlights.length + 1,
            text: sentence.trim().substring(0, 100) + (sentence.length > 100 ? '...' : ''),
            timestamps: [{ start: (highlights.length + i) * 30, end: (highlights.length + i + 1) * 30 }]
          })
        })
      }

      return highlights.slice(0, 5)
    }

    return {
      highlights: generateHighlights(),
      sentiment: sentences.slice(0, 3).map((sentence, i) => ({
        text: sentence.trim(),
        start: i * 30,
        end: (i + 1) * 30,
        sentiment: 'neutral',
        confidence: 0.8
      })),
      chapters: paragraphs.slice(0, 3).map((paragraph, i) => ({
        summary: paragraph.trim().substring(0, 150) + (paragraph.length > 150 ? '...' : ''),
        headline: `Key Point ${i + 1}`,
        start: i * 60,
        end: (i + 1) * 60
      }))
    }
  }

  const fallbackData = generateFallbackData(transcriptionResult.text || '')

  let transcriptionId = null

  try {
    await connectDB()

    const transcriptionDoc = new Transcription({
      userId: userId,
      youtubeUrl: youtubeUrl,
      videoTitle: videoTitle,
      videoId: videoId,
      transcript: transcriptionResult.text || '',
      confidence: transcriptionResult.confidence || 0.95,
      audioDuration: transcriptionResult.audio_duration || 0,
      languageCode: transcriptionResult.language_code || 'en',
      words: transcriptionResult.words || [],
      highlights: (transcriptionResult.auto_highlights_result?.results || []).map((h: any) => ({
        count: h.count || 1,
        rank: h.rank && !isNaN(h.rank) ? Math.max(1, Math.round(h.rank * 10)) : 1,
        text: h.text || '',
        timestamps: h.timestamps || []
      })),
      sentiment: transcriptionResult.sentiment_analysis?.results || [],
      chapters: transcriptionResult.auto_chapters_result?.results || [],
      entities: (transcriptionResult.entities || []).map((e: any) => ({
        text: e.text || '',
        entityType: e.entity_type || 'unknown',
        start: e.start || 0,
        end: e.end || 0
      })),
      speakerLabels: Array.isArray(transcriptionResult.speaker_labels) ? transcriptionResult.speaker_labels : [],
      isCached: false,
      cachedAt: new Date(),
      createdAt: new Date(),
      status: 'completed'
    })

    console.log('💾 Attempting to save transcription document:', {
      userId: transcriptionDoc.userId,
      youtubeUrl: transcriptionDoc.youtubeUrl,
      videoTitle: transcriptionDoc.videoTitle,
      highlightsCount: transcriptionDoc.highlights?.length || 0,
      speakerLabelsCount: transcriptionDoc.speakerLabels?.length || 0
    })

    await transcriptionDoc.save()
    transcriptionId = transcriptionDoc._id
    console.log('✅ Transcription saved to database with ID:', transcriptionId)

    try {
      console.log('📝 Creating ProcessedVideos record for video:', videoId, 'userId:', userId)
      const processedVideo = new ProcessedVideos({
        userId: userId,
        videoId: videoId,
        youtubeUrl: youtubeUrl,
        processedAt: new Date(),
        transcriptionId: transcriptionId
      })
      await processedVideo.save()
      console.log('✅ ProcessedVideos record created for video:', videoId, 'with ID:', processedVideo._id)

      const verifyRecord = await ProcessedVideos.findOne({ videoId: videoId, userId: userId })
      console.log('🔍 Verification - ProcessedVideos record exists after creation:', verifyRecord ? 'Yes' : 'No')
    } catch (processedVideoError) {
      console.warn('⚠️ Failed to create ProcessedVideos record:', processedVideoError)
      console.error('❌ Full error details:', processedVideoError)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const hoursUsed = (transcriptionResult.audio_duration || 0) / 3600

    let usageDoc = await UsageTracking.findOne({
      userId: userId,
      date: today
    })

    if (!usageDoc) {
      usageDoc = new UsageTracking({
        userId: userId,
        date: today,
        hoursUsed: hoursUsed,
        transcriptionsCount: 1,
        exportsCount: 0,
        tier: 'basic'
      })
    } else {
      usageDoc.hoursUsed += hoursUsed
      usageDoc.transcriptionsCount += 1
    }

    await usageDoc.save()
    console.log('📊 Usage tracking updated:', {
      hoursUsed: usageDoc.hoursUsed,
      transcriptionsCount: usageDoc.transcriptionsCount
    })
  } catch (dbError: any) {
    console.error('❌ Database error during save:', dbError)
    console.error('❌ Error details:', {
      name: dbError.name,
      message: dbError.message,
      stack: dbError.stack
    })
  }

  const resultData = {
    id: transcriptionId,
    transcriptionId: transcriptionId,
    transcript: transcriptionResult.text,
    confidence: transcriptionResult.confidence || 0.95,
    audio_duration: transcriptionResult.audio_duration || 0,
    words: transcriptionResult.words || [],
    highlights: (transcriptionResult.auto_highlights_result?.results || []).map((h: any) => ({
      ...h,
      rank: h.rank && !isNaN(h.rank) ? Math.max(1, Math.round(h.rank * 10)) : 1
    })).length > 0
      ? (transcriptionResult.auto_highlights_result?.results || []).map((h: any) => ({
          ...h,
          rank: h.rank && !isNaN(h.rank) ? Math.max(1, Math.round(h.rank * 10)) : 1
        }))
      : fallbackData.highlights,
    sentiment: transcriptionResult.sentiment_analysis?.results || [],
    chapters: transcriptionResult.auto_chapters_result?.results || [],
    entities: transcriptionResult.entities || [],
    speaker_labels: transcriptionResult.speaker_labels || [],
    language_code: transcriptionResult.language_code || 'en',
    youtube_url: youtubeUrl,
    videoTitle: videoTitle,
    videoId: videoId,
    status: 'completed'
  }

  const cacheKey = `transcription_${youtubeUrl}`
  transcriptionCache.set(cacheKey, { data: resultData, timestamp: Date.now() })

  try {
    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL
    if (appOrigin) {
      const axios = require('axios')
      await axios.post(`${appOrigin}/api/credits/track`, {
        transcriptionId: transcriptionId,
        youtubeUrl: youtubeUrl,
        videoId: videoId,
        audioDuration: transcriptionResult.audio_duration || 0,
        processingTime: Date.now() - startTime,
        fileSize: 0,
        quality: 'best',
        language: transcriptionResult.language_code || 'en',
        speakerCount: transcriptionResult.speaker_labels?.length || 1,
        wordCount: transcriptionResult.words?.length || 0
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
      console.log('💰 Credit usage tracked successfully')
    } else {
      console.log('⚠️ Skipping credit tracking because no app origin is configured')
    }
  } catch (creditError) {
    console.error('❌ Failed to track credit usage:', creditError)
    console.log('⚠️ Credit tracking failed, but transcription completed successfully')
  }

  return NextResponse.json({
    success: true,
    ...resultData,
    transcriptionId: transcriptionId
  })
}
