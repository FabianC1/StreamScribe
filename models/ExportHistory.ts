import mongoose, { Document, Schema } from 'mongoose'

export interface IExportHistory extends Document {
  userId: mongoose.Types.ObjectId
  transcriptionId: mongoose.Types.ObjectId
  format: 'TXT' | 'DOCX' | 'SRT' | 'VTT' | 'MP3' | 'MP4'
  filename: string
  fileSize: number
  cloudStorageUrl?: string // S3/Google Cloud Storage URL for large files
  downloadDate: Date
  success: boolean
  errorMessage?: string
  createdAt: Date
  updatedAt: Date
}

const ExportHistorySchema = new Schema<IExportHistory>({
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
  format: {
    type: String,
    required: true,
    enum: ['TXT', 'DOCX', 'SRT', 'VTT', 'MP3', 'MP4'],
  },
  filename: {
    type: String,
    required: true,
    trim: true,
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0,
  },
  cloudStorageUrl: {
    type: String,
    required: false,
    trim: true,
  },
  downloadDate: {
    type: Date,
    default: Date.now,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
  errorMessage: {
    type: String,
    required: false,
    trim: true,
  },
}, {
  timestamps: true,
})

// Create indexes for better performance
ExportHistorySchema.index({ userId: 1, downloadDate: -1 })
ExportHistorySchema.index({ userId: 1, format: 1 })
ExportHistorySchema.index({ transcriptionId: 1 })
ExportHistorySchema.index({ success: 1, downloadDate: -1 })

// Virtual for file size in human readable format
ExportHistorySchema.virtual('fileSizeFormatted').get(function() {
  if (this.fileSize < 1024) return `${this.fileSize} B`
  if (this.fileSize < 1024 * 1024) return `${(this.fileSize / 1024).toFixed(1)} KB`
  if (this.fileSize < 1024 * 1024 * 1024) return `${(this.fileSize / (1024 * 1024)).toFixed(1)} MB`
  return `${(this.fileSize / (1024 * 1024 * 1024)).toFixed(1)} GB`
})

// Virtual for format description
ExportHistorySchema.virtual('formatDescription').get(function() {
  const descriptions = {
    'TXT': 'Plain text format',
    'DOCX': 'Microsoft Word document',
    'SRT': 'SubRip subtitle format',
    'VTT': 'WebVTT subtitle format',
    'MP3': 'Audio file (MP3)',
    'MP4': 'Video file (MP4)'
  }
  return descriptions[this.format] || this.format
})

export default mongoose.models.ExportHistory || mongoose.model<IExportHistory>('ExportHistory', ExportHistorySchema)
