import { Schema, model, Document } from 'mongoose'

export interface VideoMetadataDocument extends Document {
  videoID: string
  title: string
  description: string
  uploadDate: string
  uploader: string // userID
  tags: string[]
  duration: number // Seconds
  thumbnailURL: string // Link to S3
  videoURL: string // Link to CDN Manifest
  totalClips: number
  views: string[] // Set of unique userIDs
  likes: string[] // Set of unique userIDs
  dislikes: string[] // Set of unique userIDs
}

const videoMetadataSchema = new Schema<VideoMetadataDocument>(
  {
    videoID: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    uploadDate: { type: String, required: false },
    uploader: { type: String, required: false },
    tags: { type: [String], required: false },
    duration: { type: Number, required: true },
    thumbnailURL: { type: String, required: false },
    videoURL: { type: String, required: true },
    totalClips: { type: Number, required: true },
    views: {
      type: [String],
      required: true,
      validate: [arrayHasNoDuplicates, 'Duplicate values not allowed.']
    },
    likes: {
      type: [String],
      required: true,
      validate: [arrayHasNoDuplicates, 'Duplicate values not allowed.']
    },
    dislikes: {
      type: [String],
      required: true,
      validate: [arrayHasNoDuplicates, 'Duplicate values not allowed.']
    }
  },
  { timestamps: true, collection: 'video_metadata' }
)

// temp as videoId will be just _id in the future
videoMetadataSchema.index({ videoID: 1 }, { unique: true })

export const VideoMetadata = model<VideoMetadataDocument>(
  'video_metadata',
  videoMetadataSchema
)

function arrayHasNoDuplicates(val: string[]): boolean {
  return new Set(val).size === val.length
}