import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs-extra'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl, format } = await request.json()
    
    if (!youtubeUrl || !format) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }
    
    // Create a temporary directory for downloads
    const tempDir = path.join(process.cwd(), 'temp')
    await fs.ensureDir(tempDir)
    
    let audioFile: string
    let videoFile: string
    
    if (format === 'mp3') {
      // Download audio
      audioFile = path.join(tempDir, `audio_${Date.now()}.mp3`)
      
      await execAsync(`yt-dlp -f bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio -o "${audioFile}" "${youtubeUrl}"`)
      
      // Check if file was created
      if (!await fs.pathExists(audioFile)) {
        throw new Error('No audio file found after yt-dlp execution')
      }
      
      // Read the file and return it
      const audioData = await fs.readFile(audioFile)
      
      // Clean up
      await fs.remove(audioFile)
      
      return new NextResponse(audioData, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': `attachment; filename="audio.mp3"`,
        },
      })
      
    } else if (format === 'mp4') {
      // Download video
      videoFile = path.join(tempDir, `video_${Date.now()}.mp4`)
      
      await execAsync(`yt-dlp -f best[ext=mp4] -o "${videoFile}" "${youtubeUrl}"`)
      
      // Check if file was created
      if (!await fs.pathExists(videoFile)) {
        throw new Error('No video file found after yt-dlp execution')
      }
      
      // Read the file and return it
      const videoData = await fs.readFile(videoFile)
      
      // Clean up
      await fs.remove(videoFile)
      
      return new NextResponse(videoData, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="video.mp4"`,
        },
      })
    }
    
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
