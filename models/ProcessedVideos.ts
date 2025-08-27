import mongoose, { Document, Schema } from 'mongoose'

export interface IProcessedVideos extends Document {
  userId: mongoose.Types.ObjectId
  videoId: string
  youtubeUrl: string
  processedAt: Date
  transcriptionId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ProcessedVideosSchema = new Schema<IProcessedVideos>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  videoId: {
    type: String,
    required: true,
    trim: true,
  },
  youtubeUrl: {
    type: String,
    required: true,
    trim: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
  transcriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transcription',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Compound index to ensure one video per user
ProcessedVideosSchema.index({ userId: 1, videoId: 1 }, { unique: true })

// Index for quick lookups
ProcessedVideosSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.models.ProcessedVideos || mongoose.model<IProcessedVideos>('ProcessedVideos', ProcessedVideosSchema)
