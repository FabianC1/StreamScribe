import mongoose, { Document, Schema } from 'mongoose'

export interface ITranscription extends Document {
  userId: mongoose.Types.ObjectId
  youtubeUrl: string
  videoTitle: string
  videoId: string
  transcript: string
  confidence: number
  audioDuration: number
  languageCode: string
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
    entityType: string
    start: number
    end: number
  }>
  speakerLabels: Array<{
    speaker: string
    start: number
    end: number
  }>
  // Cloud storage references (not actual files)
  audioFileUrl?: string
  videoFileUrl?: string
  isCached: boolean
  cachedAt: Date
  createdAt: Date
  updatedAt: Date
}

const TranscriptionSchema = new Schema<ITranscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  youtubeUrl: {
    type: String,
    required: true,
    trim: true,
  },
  videoTitle: {
    type: String,
    required: true,
    trim: true,
  },
  videoId: {
    type: String,
    required: true,
    trim: true,
  },
  transcript: {
    type: String,
    required: true,
    trim: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  audioDuration: {
    type: Number,
    required: true,
    min: 0,
  },
  languageCode: {
    type: String,
    required: true,
    default: 'en',
    trim: true,
  },
  words: [{
    text: {
      type: String,
      required: true,
      trim: true,
    },
    start: {
      type: Number,
      required: true,
      min: 0,
    },
    end: {
      type: Number,
      required: true,
      min: 0,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    speaker: {
      type: String,
      required: true,
      trim: true,
    },
  }],
  highlights: [{
    count: {
      type: Number,
      required: true,
      min: 0,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    timestamps: [{
      start: {
        type: Number,
        required: true,
        min: 0,
      },
      end: {
        type: Number,
        required: true,
        min: 0,
      },
    }],
  }],
  sentiment: [{
    text: {
      type: String,
      required: true,
      trim: true,
    },
    start: {
      type: Number,
      required: true,
      min: 0,
    },
    end: {
      type: Number,
      required: true,
      min: 0,
    },
    sentiment: {
      type: String,
      required: true,
      enum: ['positive', 'negative', 'neutral'],
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  }],
  chapters: [{
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    start: {
      type: Number,
      required: true,
      min: 0,
    },
    end: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  entities: [{
    text: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    start: {
      type: Number,
      required: true,
      min: 0,
    },
    end: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  speakerLabels: [{
    speaker: {
      type: String,
      required: true,
      trim: true,
    },
    start: {
      type: Number,
      required: true,
      min: 0,
    },
    end: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  // Cloud storage references (not actual files)
  audioFileUrl: {
    type: String,
    required: false,
    trim: true,
  },
  videoFileUrl: {
    type: String,
    required: false,
    trim: true,
  },
  isCached: {
    type: Boolean,
    default: false,
  },
  cachedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
})

// Create indexes for better performance
TranscriptionSchema.index({ userId: 1, createdAt: -1 })
TranscriptionSchema.index({ youtubeUrl: 1 })
TranscriptionSchema.index({ videoId: 1 })
TranscriptionSchema.index({ isCached: 1, cachedAt: 1 })
TranscriptionSchema.index({ languageCode: 1 })

// Virtual for duration in minutes
TranscriptionSchema.virtual('durationMinutes').get(function() {
  return Math.floor(this.audioDuration / 60)
})

// Virtual for duration in seconds
TranscriptionSchema.virtual('durationSeconds').get(function() {
  return this.audioDuration % 60
})

// Virtual for formatted duration
TranscriptionSchema.virtual('formattedDuration').get(function() {
  const mins = Math.floor(this.audioDuration / 60)
  const secs = this.audioDuration % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

export default mongoose.models.Transcription || mongoose.model<ITranscription>('Transcription', TranscriptionSchema)
