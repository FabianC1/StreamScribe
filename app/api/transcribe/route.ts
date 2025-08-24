import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import fs from 'fs-extra'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY || '1e45758686fb49dfbef78cc72e942b2a'
const baseUrl = 'https://api.assemblyai.com'

const headers = {
  authorization: ASSEMBLYAI_API_KEY,
}

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl } = await request.json()

    if (!youtubeUrl) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 })
    }

    // Create temp directory for audio files
    const tempDir = path.join(process.cwd(), 'temp')
    await fs.ensureDir(tempDir)
    
    // Generate unique filename
    const timestamp = Date.now()
    const audioPath = path.join(tempDir, `audio_${timestamp}.mp3`)

    try {
      // Extract audio using yt-dlp
      console.log('Extracting audio from YouTube video...')
      const ytDlpCommand = `yt-dlp -f "bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio" -o "${audioPath}" --extract-audio --audio-format mp3 "${youtubeUrl}"`
      
      await execAsync(ytDlpCommand)
      
      // Check if audio file was created
      if (!await fs.pathExists(audioPath)) {
        throw new Error('Failed to extract audio from YouTube video')
      }

      // Read audio file
      const audioData = await fs.readFile(audioPath)
      
      // Upload to AssemblyAI
      console.log('Uploading audio to AssemblyAI...')
      const uploadResponse = await axios.post(`${baseUrl}/v2/upload`, audioData, {
        headers,
      })
      
      const audioUrl = uploadResponse.data.upload_url

      // Request transcription
      console.log('Requesting transcription...')
      const transcriptData = {
        audio_url: audioUrl,
        speech_model: 'universal',
        language_code: 'en', // You can make this configurable
        punctuate: true,
        format_text: true,
        speaker_labels: true,
        auto_highlights: true,
        sentiment_analysis: true,
        auto_chapters: true,
        entity_detection: true,
      }

      const transcriptResponse = await axios.post(`${baseUrl}/v2/transcript`, transcriptData, {
        headers,
      })

      const transcriptId = transcriptResponse.data.id
      const pollingEndpoint = `${baseUrl}/v2/transcript/${transcriptId}`

      // Poll for completion
      console.log('Polling for transcription completion...')
      let transcriptionResult
      let attempts = 0
      const maxAttempts = 60 // 5 minutes max (60 * 5 seconds)

      while (attempts < maxAttempts) {
        const pollingResponse = await axios.get(pollingEndpoint, { headers })
        transcriptionResult = pollingResponse.data

        if (transcriptionResult.status === 'completed') {
          console.log('Transcription completed successfully!')
          break
        } else if (transcriptionResult.status === 'error') {
          throw new Error(`Transcription failed: ${transcriptionResult.error}`)
        }

        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++
      }

      if (transcriptionResult.status !== 'completed') {
        throw new Error('Transcription timed out')
      }

      // Clean up temp audio file
      try {
        await fs.remove(audioPath)
      } catch (cleanupError) {
        console.warn('Failed to clean up temp audio file:', cleanupError)
      }

      // Return comprehensive results
      return NextResponse.json({
        success: true,
        transcript: transcriptionResult.text,
        confidence: transcriptionResult.confidence,
        audio_duration: transcriptionResult.audio_duration,
        words: transcriptionResult.words,
        highlights: transcriptionResult.auto_highlights_result,
        sentiment: transcriptionResult.sentiment_analysis_results,
        chapters: transcriptionResult.chapters,
        entities: transcriptionResult.entities,
        speaker_labels: transcriptionResult.speaker_labels,
        language_code: transcriptionResult.language_code,
        youtube_url: youtubeUrl,
      })

    } catch (error) {
      // Clean up temp audio file on error
      try {
        if (await fs.pathExists(audioPath)) {
          await fs.remove(audioPath)
        }
      } catch (cleanupError) {
        console.warn('Failed to clean up temp audio file on error:', cleanupError)
      }
      throw error
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
