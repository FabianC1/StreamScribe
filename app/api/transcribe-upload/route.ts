import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import axios from 'axios'
import fs from 'fs-extra'
import path from 'path'
import connectDB from '@/lib/mongodb'
import { Transcription, UsageTracking } from '@/models'
import { authOptions } from '@/lib/auth-options'
import { requireSubscription } from '@/lib/subscriptionCheck'

export const runtime = 'nodejs'

if (!process.env.ASSEMBLYAI_API_KEY) {
  throw new Error('ASSEMBLYAI_API_KEY environment variable is not set')
}

const headers = {
  authorization: process.env.ASSEMBLYAI_API_KEY,
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
}

async function requestAssemblyAiTranscript(audioUrl: string) {
  const transcriptResponse = await axios.post('https://api.assemblyai.com/v2/transcript', {
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
  }, { headers })

  const transcriptId = transcriptResponse.data.id

  for (let attempts = 0; attempts < 60; attempts++) {
    const pollingResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, { headers })
    const transcriptionResult = pollingResponse.data

    if (transcriptionResult.status === 'completed') {
      return transcriptionResult
    }

    if (transcriptionResult.status === 'error') {
      throw new Error(`Transcription failed: ${transcriptionResult.error}`)
    }

    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  throw new Error('Transcription timeout - media may be too long')
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const subscribedUser = await requireSubscription()
    if (!subscribedUser) {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
    }

    const formData = await request.formData()
    const mediaFile = formData.get('mediaFile')

    if (!(mediaFile instanceof File)) {
      return NextResponse.json({ error: 'No media file provided' }, { status: 400 })
    }

    const userId = session.user.id
    const safeName = sanitizeFileName(mediaFile.name || 'uploaded-media')
    const storedFileName = `${Date.now()}-${safeName}`
    const mediaDir = path.join(process.cwd(), 'user-media', userId)
    const mediaPath = path.join(mediaDir, storedFileName)

    await fs.ensureDir(mediaDir)
    const fileBuffer = Buffer.from(await mediaFile.arrayBuffer())
    await fs.writeFile(mediaPath, fileBuffer)

    const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', fileBuffer, { headers })
    const transcriptionResult = await requestAssemblyAiTranscript(uploadResponse.data.upload_url)

    const mediaUrl = `/api/media?userId=${encodeURIComponent(userId)}&file=${encodeURIComponent(storedFileName)}`
    const mediaType = mediaFile.type || 'video/mp4'

    let transcriptionId = null
    try {
      await connectDB()

      const transcriptionDoc = new Transcription({
        userId,
        youtubeUrl: mediaUrl,
        videoTitle: mediaFile.name,
        videoId: storedFileName,
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

      await transcriptionDoc.save()
      transcriptionId = transcriptionDoc._id

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let usageDoc = await UsageTracking.findOne({ userId, date: today })
      const hoursUsed = (transcriptionResult.audio_duration || 0) / 3600

      if (!usageDoc) {
        usageDoc = new UsageTracking({
          userId,
          date: today,
          hoursUsed,
          transcriptionsCount: 1,
          exportsCount: 0,
          tier: 'basic'
        })
      } else {
        usageDoc.hoursUsed += hoursUsed
        usageDoc.transcriptionsCount += 1
      }

      await usageDoc.save()
    } catch (dbError) {
      console.error('Failed to save uploaded transcription:', dbError)
    }

    return NextResponse.json({
      success: true,
      id: transcriptionId,
      transcriptionId,
      transcript: transcriptionResult.text || '',
      confidence: transcriptionResult.confidence || 0.95,
      audio_duration: transcriptionResult.audio_duration || 0,
      words: transcriptionResult.words || [],
      highlights: (transcriptionResult.auto_highlights_result?.results || []).map((h: any) => ({
        ...h,
        rank: h.rank && !isNaN(h.rank) ? Math.max(1, Math.round(h.rank * 10)) : 1
      })),
      sentiment: transcriptionResult.sentiment_analysis?.results || [],
      chapters: transcriptionResult.auto_chapters_result?.results || [],
      entities: transcriptionResult.entities || [],
      speaker_labels: transcriptionResult.speaker_labels || [],
      language_code: transcriptionResult.language_code || 'en',
      youtube_url: mediaUrl,
      media_url: mediaUrl,
      media_type: mediaType,
      source_type: 'uploaded',
      videoTitle: mediaFile.name,
      videoId: storedFileName,
      status: 'completed'
    })
  } catch (error) {
    console.error('Upload transcription failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to transcribe uploaded media'
    }, { status: 500 })
  }
}