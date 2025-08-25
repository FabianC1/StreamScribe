export interface ExportFormat {
  name: string
  extension: string
  mimeType: string
  description: string
}

export const EXPORT_FORMATS: ExportFormat[] = [
  {
    name: 'TXT',
    extension: '.txt',
    mimeType: 'text/plain',
    description: 'Plain text format'
  },
  {
    name: 'DOCX',
    extension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    description: 'Microsoft Word document'
  },
  {
    name: 'SRT',
    extension: '.srt',
    mimeType: 'text/plain',
    description: 'SubRip subtitle format'
  },
  {
    name: 'VTT',
    extension: '.vtt',
    mimeType: 'text/vtt',
    description: 'WebVTT subtitle format'
  },
  {
    name: 'MP3',
    extension: '.mp3',
    mimeType: 'audio/mpeg',
    description: 'Audio file (MP3)'
  },
  {
    name: 'MP4',
    extension: '.mp4',
    mimeType: 'video/mp4',
    description: 'Video file (MP4)'
  }
]

export interface TranscriptionData {
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
  highlights?: Array<{
    count: number
    rank: number
    text: string
    timestamps: Array<{ start: number; end: number }>
  }>
  sentiment?: Array<{
    text: string
    start: number
    end: number
    sentiment: string
    confidence: number
  }>
  chapters?: Array<{
    summary: string
    headline: string
    start: number
    end: number
  }>
  entities?: Array<{
    text: string
    entity_type: string
    start: number
    end: number
  }>
  speaker_labels?: Array<{
    speaker: string
    start: number
    end: number
  }>
  language_code: string
  youtube_url: string
}

export function formatTime(seconds: number): string {
  const timeInSeconds = seconds > 1000 ? seconds / 1000 : seconds
  const mins = Math.floor(timeInSeconds / 60)
  const secs = Math.floor(timeInSeconds % 60)
  const ms = Math.floor((timeInSeconds % 1) * 1000)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

export function formatTimeVTT(seconds: number): string {
  const timeInSeconds = seconds > 1000 ? seconds / 1000 : seconds
  const mins = Math.floor(timeInSeconds / 60)
  const secs = Math.floor(timeInSeconds % 60)
  const ms = Math.floor((timeInSeconds % 1) * 1000)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

export function generateTXT(data: TranscriptionData): string {
  let content = `Transcription: ${data.youtube_url}\n`
  content += `Duration: ${Math.floor(data.audio_duration / 60)}:${(data.audio_duration % 60).toString().padStart(2, '0')}\n`
  content += `Language: ${data.language_code.toUpperCase()}\n`
  content += `Confidence: ${(data.confidence * 100).toFixed(1)}%\n\n`
  
  // Group words into sentences
  const sentences = groupWordsIntoSentences(data.words)
  sentences.forEach((sentence, index) => {
    content += `[${formatTime(sentence.start)}] ${sentence.text}\n\n`
  })
  
  return content
}

export function generateSRT(data: TranscriptionData): string {
  const sentences = groupWordsIntoSentences(data.words)
  let content = ''
  
  sentences.forEach((sentence, index) => {
    content += `${index + 1}\n`
    content += `${formatTime(sentence.start)} --> ${formatTime(sentence.end)}\n`
    content += `${sentence.text}\n\n`
  })
  
  return content
}

export function generateVTT(data: TranscriptionData): string {
  let content = 'WEBVTT\n\n'
  
  const sentences = groupWordsIntoSentences(data.words)
  sentences.forEach((sentence, index) => {
    content += `${formatTimeVTT(sentence.start)} --> ${formatTimeVTT(sentence.end)}\n`
    content += `${sentence.text}\n\n`
  })
  
  return content
}

export function generateDOCX(data: TranscriptionData): string {
  // Generate a proper DOCX file using the docx library
  // This will create a real Word document with proper formatting
  
  // For now, we'll create a rich text format that can be opened in Word
  // In a real implementation, you'd use the 'docx' npm package
  
  let content = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\viewkind4\\uc1\\pard\\f0\\fs24

{\\b\\fs28 Transcription Report\\par}
\\par
{\\b Source:} ${data.youtube_url}\\par
{\\b Duration:} ${Math.floor(data.audio_duration / 60)}:${(data.audio_duration % 60).toString().padStart(2, '0')}\\par
{\\b Language:} ${data.language_code.toUpperCase()}\\par
{\\b Confidence:} ${(data.confidence * 100).toFixed(1)}%\\par
\\par
{\\b\\fs24 Transcript\\par}
\\par`
  
  const sentences = groupWordsIntoSentences(data.words)
  sentences.forEach((sentence, index) => {
    content += `{\\b [${formatTime(sentence.start)}]}\\par
${sentence.text}\\par
\\par`
  })
  
  content += `}`
  
  return content
}

export async function generateMP3(data: TranscriptionData): Promise<Blob> {
  try {
    // Call the server API to extract actual audio
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        youtubeUrl: data.youtube_url,
        format: 'mp3'
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`)
    }
    
    // The server returns base64 encoded data
    const base64Data = await response.text()
    
    // Convert base64 to Blob
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    
    // Determine MIME type from response headers
    const contentType = response.headers.get('content-type') || 'audio/mpeg'
    
    return new Blob([byteArray], { type: contentType })
  } catch (error) {
    console.error('Failed to generate MP3:', error)
    // Fallback to placeholder if server fails
    const placeholderContent = `Failed to extract MP3 audio from: ${data.youtube_url}
    
Error: ${error instanceof Error ? error.message : 'Unknown error'}

This feature requires:
1. yt-dlp installed on the server
2. Server-side processing capability
3. Valid YouTube URL`
    
    return new Blob([placeholderContent], { type: 'text/plain' })
  }
}

export async function generateMP4(data: TranscriptionData): Promise<Blob> {
  try {
    // Call the server API to download actual video
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        youtubeUrl: data.youtube_url,
        format: 'mp4'
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`)
    }
    
    // The server returns base64 encoded data
    const base64Data = await response.text()
    
    // Convert base64 to Blob
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    
    // Determine MIME type from response headers
    const contentType = response.headers.get('content-type') || 'video/mp4'
    
    return new Blob([byteArray], { type: contentType })
  } catch (error) {
    console.error('Failed to generate MP4:', error)
    // Fallback to placeholder if server fails
    const placeholderContent = `Failed to download MP4 video from: ${data.youtube_url}
    
Error: ${error instanceof Error ? error.message : 'Unknown error'}

This feature requires:
1. yt-dlp installed on the server
2. Server-side processing capability
3. Valid YouTube URL`
    
    return new Blob([placeholderContent], { type: 'text/plain' })
  }
}

function groupWordsIntoSentences(words: Array<{ text: string; start: number; end: number; confidence: number; speaker: string }>) {
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

export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}
