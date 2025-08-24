// Progress tracking utility functions
let currentProgress = '🚀 Starting transcription...'
let isCompleted = false
let currentUrl = ''

export function updateProgress(message: string) {
  currentProgress = message
  console.log('Progress updated:', message)
}

export function setCompleted() {
  isCompleted = true
  currentProgress = '✅ Transcription completed!'
}

export function getProgress() {
  return { progress: currentProgress, isCompleted, currentUrl }
}

export function resetProgress(youtubeUrl: string) {
  currentProgress = '🚀 Starting transcription...'
  isCompleted = false
  currentUrl = youtubeUrl
}
