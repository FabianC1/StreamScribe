export interface TranscriptionResponse {
  success: boolean
  transcription: string
  videoId: string
  duration: string
  confidence: number
  language: string
  timestamp: string
}

export interface TranscriptionError {
  error: string
  message?: string
}

export const transcribeVideo = async (youtubeUrl: string, userId?: string): Promise<TranscriptionResponse> => {
  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        youtubeUrl,
        userId,
      }),
    })

    if (!response.ok) {
      const errorData: TranscriptionError = await response.json()
      throw new Error(errorData.error || 'Failed to transcribe video')
    }

    const data: TranscriptionResponse = await response.json()
    return data
  } catch (error) {
    console.error('Transcription error:', error)
    throw error
  }
}

export const validateYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  return youtubeRegex.test(url)
}

export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export const estimateTranscriptionTime = (durationSeconds: number): number => {
  // Rough estimate: 1 minute of video takes about 30 seconds to transcribe
  // This is a conservative estimate and may vary based on the AI service
  return Math.ceil(durationSeconds / 2)
}
