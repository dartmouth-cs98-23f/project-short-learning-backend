import mongoose, { Schema, model, Document } from 'mongoose'
import { arrayHasNoDuplicates } from './utils/validators'

export interface ClipMetadataDocument extends Document {
  videoId: mongoose.Types.ObjectId
  title: string
  description: string
  uploadDate: Date
  uploader: mongoose.Types.ObjectId // userID
  tags: string[]
  duration: number // Seconds
  thumbnailURL: string // Link to S3
  clipURL: string // Link to CDN Manifest
  views: mongoose.Types.ObjectId[] // Set of unique userIDs
  likes: mongoose.Types.ObjectId[] // Set of unique userIDs
  dislikes: mongoose.Types.ObjectId[] // Set of unique userIDs
}

const clipMetadataSchema = new Schema<ClipMetadataDocument>(
  {
    videoId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    uploadDate: { type: Date, required: true },
    uploader: { type: Schema.Types.ObjectId, ref: 'Users', required: false },
    tags: { type: [String], required: false },
    duration: { type: Number, required: true },
    thumbnailURL: { type: String, required: false },
    clipURL: { type: String, required: true },
    views: {
      type: [Schema.Types.ObjectId],
      required: true,
      validate: [arrayHasNoDuplicates, 'Duplicate values not allowed.']
    },
    likes: {
      type: [Schema.Types.ObjectId],
      required: true,
      validate: [arrayHasNoDuplicates, 'Duplicate values not allowed.']
    },
    dislikes: {
      type: [Schema.Types.ObjectId],
      required: true,
      validate: [arrayHasNoDuplicates, 'Duplicate values not allowed.']
    }
  },
  { timestamps: true, collection: 'clip_metadata' }
)

export const ClipMetadata = model<ClipMetadataDocument>(
  'ClipMetadata',
  clipMetadataSchema
)