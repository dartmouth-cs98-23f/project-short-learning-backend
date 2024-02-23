import mongoose, { Schema, model, Document } from 'mongoose'
import { arrayHasNoDuplicates } from '../utils/schema_validators'

export interface VideoMetadataDocument extends Document {
  title: string
  description: string
  youtubeURL: string
  uploadDate: Date
  uploader: mongoose.Types.ObjectId // userID
  duration: number // Seconds
  thumbnailURL: string // Link to S3
  topicId: mongoose.Types.ObjectId
  clips: mongoose.Types.ObjectId[]
  views: mongoose.Types.ObjectId[] // Set of unique userIDs
  likes: mongoose.Types.ObjectId[] // Set of unique userIDs
  dislikes: mongoose.Types.ObjectId[] // Set of unique userIDs
  isVectorized: boolean
  isClipped: boolean
}

const videoMetadataSchema = new Schema<VideoMetadataDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    youtubeURL: { type: String, required: false},
    uploadDate: { type: Date, required: true },
    uploader: { type: Schema.Types.ObjectId, required: false },
    duration: { type: Number, required: true },
    thumbnailURL: { type: String, required: false },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'TopicMetadata',
      required: false
    },
    clips: {
      type: [Schema.Types.ObjectId],
      ref: 'ClipMetadata',
      required: false
    },
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
    },
    isVectorized: { type: Boolean, required: false },
    isClipped: { type: Boolean, required: false }
  },
  { timestamps: true, collection: 'video_metadata' }
)

export const VideoMetadata = model<VideoMetadataDocument>(
  'VideoMetadata',
  videoMetadataSchema
)
