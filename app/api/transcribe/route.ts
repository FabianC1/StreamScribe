import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import fs from 'fs-extra'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { updateProgress, setCompleted } from './progress/route'

const execAsync = promisify(exec)

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY || '1e45758686fb49dfbef78cc72e942b2a'
const baseUrl = 'https://api.assemblyai.com'

const headers = {
  authorization: ASSEMBLYAI_API_KEY,
}

// Mock data for testing without using AssemblyAI credits
const mockTranscriptionData = {
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
  youtube_url: ""
}

// Simple in-memory cache for server-side duplicate prevention
const transcriptionCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl } = await request.json()
    
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

    // Check server-side cache first
    const cacheKey = `transcription_${youtubeUrl}`
    const cachedResult = transcriptionCache.get(cacheKey)
    
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
      console.log('🔄 Returning cached result from server for:', youtubeUrl)
      return NextResponse.json({
        success: true,
        ...cachedResult.data,
        isCached: true,
        cachedAt: cachedResult.timestamp
      })
    }

    // Real AssemblyAI processing for actual YouTube URLs
    console.log('🚀 Starting transcription for:', youtubeUrl)
    updateProgress('🚀 Starting transcription...')

    // Create temp directory
    const tempDir = path.join(process.cwd(), 'temp')
    await fs.ensureDir(tempDir)
    
    const audioFile = path.join(tempDir, `audio_${Date.now()}.mp3`)
    
    try {
      // Extract audio using yt-dlp
      console.log('📥 Extracting audio...')
      updateProgress('📥 Extracting audio...')
      await execAsync(`yt-dlp -f "bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio" --audio-format mp3 --audio-quality 0 -o "${audioFile}" "${youtubeUrl}"`)
      
      // Read the audio file
      const audioData = await fs.readFile(audioFile)
      
      // Upload to AssemblyAI
      console.log('☁️ Uploading to AssemblyAI...')
      updateProgress('☁️ Uploading to AssemblyAI...')
      const uploadResponse = await axios.post(`${baseUrl}/v2/upload`, audioData, { headers })
      const audioUrl = uploadResponse.data.upload_url
      
      // Request transcription
      console.log('🎯 Requesting transcription...')
      updateProgress('🎯 Requesting transcription...')
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
      
      // Poll for completion
      console.log('⏳ Polling for completion...')
      updateProgress('⏳ Polling for completion...')
      let maxAttempts = 60 // 5 minutes max
      let attempts = 0
      
      while (attempts < maxAttempts) {
        const pollingResponse = await axios.get(`${baseUrl}/v2/transcript/${transcriptId}`, { headers })
        const transcriptionResult = pollingResponse.data
        
        if (transcriptionResult.status === 'completed') {
          console.log('✅ Transcription completed!')
          updateProgress('✅ Transcription completed!')
          setCompleted()
          
          // Debug the response structure
          console.log('📊 Full transcription result:', JSON.stringify(transcriptionResult, null, 2))
          console.log('🔍 Highlights result:', transcriptionResult.auto_highlights_result)
          console.log('🔍 Sentiment result:', transcriptionResult.sentiment_analysis)
          console.log('🔍 Chapters result:', transcriptionResult.auto_chapters_result)
          
          // Clean up temp file
          await fs.remove(audioFile)
          
          // Generate fallback data if AssemblyAI features are empty
          const generateFallbackData = (text: string) => {
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
            const words = text.toLowerCase().match(/\b\w+\b/g) || []
            const wordFreq: { [key: string]: number } = {}
            
            words.forEach(word => {
              if (word.length > 3) wordFreq[word] = (wordFreq[word] || 0) + 1
            })
            
            const topWords = Object.entries(wordFreq)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([word]) => word)
            
            return {
              highlights: topWords.map((word, i) => ({
                count: wordFreq[word],
                rank: i + 1,
                text: word,
                timestamps: [{ start: 0, end: 0 }]
              })),
              sentiment: sentences.slice(0, 3).map((sentence, i) => ({
                text: sentence.trim(),
                start: i * 30,
                end: (i + 1) * 30,
                sentiment: 'neutral',
                confidence: 0.8
              })),
              chapters: sentences.slice(0, 3).map((sentence, i) => ({
                summary: sentence.trim(),
                headline: `Section ${i + 1}`,
                start: i * 30,
                end: (i + 1) * 30
              }))
            }
          }
          
          const fallbackData = generateFallbackData(transcriptionResult.text || '')
          
          // Cache the result
          const resultData = {
            transcript: transcriptionResult.text,
            confidence: transcriptionResult.confidence || 0.95,
            audio_duration: transcriptionResult.audio_duration || 0,
            words: transcriptionResult.words || [],
            highlights: transcriptionResult.auto_highlights_result?.results?.length > 0 
              ? transcriptionResult.auto_highlights_result.results 
              : fallbackData.highlights,
            sentiment: transcriptionResult.sentiment_analysis?.results?.length > 0 
              ? transcriptionResult.sentiment_analysis.results 
              : fallbackData.sentiment,
            chapters: transcriptionResult.auto_chapters_result?.results?.length > 0 
              ? transcriptionResult.auto_chapters_result.results 
              : fallbackData.chapters,
            entities: transcriptionResult.entities || [],
            speaker_labels: transcriptionResult.speaker_labels || [],
            language_code: transcriptionResult.language_code || 'en',
            youtube_url: youtubeUrl
          }
          
          transcriptionCache.set(cacheKey, { data: resultData, timestamp: Date.now() })
          
          return NextResponse.json({
            success: true,
            ...resultData
          })
        } else if (transcriptionResult.status === 'error') {
          throw new Error(`Transcription failed: ${transcriptionResult.error}`)
        }
        
        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++
      }
      
      throw new Error('Transcription timeout - video may be too long')
      
    } finally {
      // Clean up temp file
      if (await fs.pathExists(audioFile)) {
        await fs.remove(audioFile)
      }
    }
    
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      {
        error: 'Transcription failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
