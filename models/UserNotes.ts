import mongoose, { Document, Schema } from 'mongoose'

export interface IUserNotes extends Document {
  userId: mongoose.Types.ObjectId
  transcriptionId: mongoose.Types.ObjectId
  youtubeUrl: string
  videoId: string
  
  // Video-level notes
  videoNotes: Array<{
    id: string
    text: string
    timestamp: Date
    createdAt: Date
  }>
  
  // Sentence-level notes
  sentenceNotes: Array<{
    id: string
    sentenceIndex: number
    startTime: number
    endTime: number
    text: string
    timestamp: Date
    createdAt: Date
  }>
  
  // Highlight notes
  highlightNotes: Array<{
    id: string
    highlightIndex: number
    text: string
    timestamp: Date
    createdAt: Date
  }>
  
  // Chapter notes
  chapterNotes: Array<{
    id: string
    chapterIndex: number
    headline: string
    text: string
    timestamp: Date
    createdAt: Date
  }>
  
  // Custom annotations
  customAnnotations: Array<{
    id: string
    type: 'bookmark' | 'important' | 'question' | 'action' | 'custom'
    text: string
    startTime?: number
    endTime?: number
    timestamp: Date
    createdAt: Date
  }>
  
  // Export history
  exportHistory: Array<{
    format: string
    exportedAt: Date
    fileSize?: number
  }>
  
  createdAt: Date
  updatedAt: Date
}

const UserNotesSchema = new Schema<IUserNotes>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transcriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transcription',
    required: true,
  },
  youtubeUrl: {
    type: String,
    required: true,
    trim: true,
  },
  videoId: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Video-level notes
  videoNotes: [{
    id: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Sentence-level notes
  sentenceNotes: [{
    id: {
      type: String,
      required: true,
    },
    sentenceIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    startTime: {
      type: Number,
      required: true,
      min: 0,
    },
    endTime: {
      type: Number,
      required: true,
      min: 0,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Highlight notes
  highlightNotes: [{
    id: {
      type: String,
      required: true,
    },
    highlightIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Chapter notes
  chapterNotes: [{
    id: {
      type: String,
      required: true,
    },
    chapterIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Custom annotations
  customAnnotations: [{
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['bookmark', 'important', 'question', 'action', 'custom'],
      default: 'custom',
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Number,
      required: false,
      min: 0,
    },
    endTime: {
      type: Number,
      required: false,
      min: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Export history
  exportHistory: [{
    format: {
      type: String,
      required: true,
      trim: true,
    },
    exportedAt: {
      type: Date,
      default: Date.now,
    },
    fileSize: {
      type: Number,
      required: false,
      min: 0,
    },
  }],
  
}, {
  timestamps: true,
})

// Create indexes for better performance
UserNotesSchema.index({ userId: 1, transcriptionId: 1 })
UserNotesSchema.index({ userId: 1, videoId: 1 })
UserNotesSchema.index({ userId: 1, createdAt: -1 })

// Virtual for total notes count
UserNotesSchema.virtual('totalNotes').get(function() {
  return (
    this.videoNotes.length +
    this.sentenceNotes.length +
    this.highlightNotes.length +
    this.chapterNotes.length +
    this.customAnnotations.length
  )
})

// Virtual for last activity
UserNotesSchema.virtual('lastActivity').get(function() {
  const allTimestamps = [
    ...this.videoNotes.map(n => n.timestamp),
    ...this.sentenceNotes.map(n => n.timestamp),
    ...this.highlightNotes.map(n => n.timestamp),
    ...this.chapterNotes.map(n => n.timestamp),
    ...this.customAnnotations.map(n => n.timestamp),
    ...this.exportHistory.map(e => e.exportedAt),
  ]
  return allTimestamps.length > 0 ? Math.max(...allTimestamps.map(t => t.getTime())) : this.updatedAt.getTime()
})

export default mongoose.models.UserNotes || mongoose.model<IUserNotes>('UserNotes', UserNotesSchema)
