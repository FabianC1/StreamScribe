import mongoose, { Document, Schema } from 'mongoose'

export interface IUserNote extends Document {
  userId: mongoose.Types.ObjectId
  transcriptionId: mongoose.Types.ObjectId
  sectionId: string // 'video' or 'sentence-{index}'
  text: string
  timestamp: Date
  createdAt: Date
  updatedAt: Date
}

const UserNoteSchema = new Schema<IUserNote>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  transcriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transcription',
    required: true,
    index: true,
  },
  sectionId: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000, // Limit note length
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
})

// Create indexes for better performance
UserNoteSchema.index({ userId: 1, transcriptionId: 1 })
UserNoteSchema.index({ userId: 1, createdAt: -1 })
UserNoteSchema.index({ transcriptionId: 1, sectionId: 1 })

// Virtual for formatted timestamp
UserNoteSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleTimeString()
})

// Virtual for note preview (first 50 characters)
UserNoteSchema.virtual('preview').get(function() {
  return this.text.length > 50 ? this.text.substring(0, 50) + '...' : this.text
})

export default mongoose.models.UserNote || mongoose.model<IUserNote>('UserNote', UserNoteSchema)
