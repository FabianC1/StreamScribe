import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl, format } = await request.json()
    
    if (!youtubeUrl || !format) {
      return NextResponse.json(
        { error: 'Missing YouTube URL or format' },
        { status: 400 }
      )
    }
    
    if (!['mp3', 'mp4'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Only mp3 and mp4 are supported' },
        { status: 400 }
      )
    }
    
    // Create a temporary directory for downloads
    const tempDir = path.join(os.tmpdir(), `streamscribe-${Date.now()}`)
    await fs.promises.mkdir(tempDir, { recursive: true })
    
    let command: string
    let outputFile: string
    
    if (format === 'mp3') {
      // Extract audio - download best audio format and let the browser handle conversion
      command = `yt-dlp -f "bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio" -o "${path.join(tempDir, 'audio.%(ext)s')}" "${youtubeUrl}"`
      // We'll find the actual downloaded file extension
      outputFile = path.join(tempDir, 'audio')
    } else {
      // Download video as MP4
      command = `yt-dlp -f "best[ext=mp4]" -o "${path.join(tempDir, 'video.%(ext)s')}" "${youtubeUrl}"`
      outputFile = path.join(tempDir, 'video.mp4')
    }
    
    console.log(`Executing command: ${command}`)
    
    // Execute the yt-dlp command
    const { stdout, stderr } = await execAsync(command, { timeout: 300000 }) // 5 minute timeout
    
    if (stderr && !stderr.includes('WARNING')) {
      console.error('yt-dlp stderr:', stderr)
    }
    
    console.log('yt-dlp stdout:', stdout)
    
    // Check if the file was created and find the actual downloaded file
    let actualOutputFile = outputFile
    if (format === 'mp3') {
      // For audio, find the actual downloaded file with its extension
      const files = await fs.promises.readdir(tempDir)
      const audioFile = files.find(file => file.match(/\.(m4a|mp3|webm|ogg)$/))
      
      if (audioFile) {
        actualOutputFile = path.join(tempDir, audioFile)
        console.log(`Found audio file: ${audioFile}`)
      } else {
        throw new Error('No audio file found after yt-dlp execution')
      }
    } else if (!fs.existsSync(outputFile)) {
      // For video, try to find the actual output file
      const files = await fs.promises.readdir(tempDir)
      const videoFile = files.find(file => file.match(/\.(mp4|webm|mkv)$/))
      
      if (videoFile) {
        actualOutputFile = path.join(tempDir, videoFile)
      } else {
        throw new Error('No video file found after yt-dlp execution')
      }
    }
    
    // Read the file
    const fileBuffer = await fs.promises.readFile(actualOutputFile)
    
    // Clean up temporary files
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true })
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError)
    }
    
    // Determine the correct MIME type and filename based on the actual file
    let mimeType: string
    let fileExtension: string
    
    if (format === 'mp3') {
      const actualExtension = path.extname(actualOutputFile).toLowerCase()
      switch (actualExtension) {
        case '.m4a':
          mimeType = 'audio/mp4'
          fileExtension = 'm4a'
          break
        case '.mp3':
          mimeType = 'audio/mpeg'
          fileExtension = 'mp3'
          break
        case '.webm':
          mimeType = 'audio/webm'
          fileExtension = 'webm'
          break
        case '.ogg':
          mimeType = 'audio/ogg'
          fileExtension = 'ogg'
          break
        default:
          mimeType = 'audio/mpeg'
          fileExtension = 'mp3'
      }
    } else {
      mimeType = 'video/mp4'
      fileExtension = 'mp4'
    }
    
    const filename = `transcript_${Date.now()}.${fileExtension}`
    
    return new NextResponse(fileBuffer.toString('base64'), {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
    
  } catch (error) {
    console.error('Download error:', error)
    
    // Clean up temp directory if it exists
    try {
      const tempDir = path.join(os.tmpdir(), `streamscribe-${Date.now()}`)
      if (fs.existsSync(tempDir)) {
        await fs.promises.rm(tempDir, { recursive: true, force: true })
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to download file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
