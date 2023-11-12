import { Schema, model, Document } from 'mongoose'
import { VideoMetadataDocument } from './video_models'

export interface TopicMetadataDocument extends Document {
  combinedTopicName: string
  topicName: string
  subTopicName: string | undefined
  description: string
  thumbnailURL: string
}

const topicMetadataSchema = new Schema<TopicMetadataDocument>(
  {
    topicName: { type: String, required: true },
    subTopicName: { type: String, required: false },
    description: { type: String, required: true },
    thumbnailURL: { type: String, required: false },
    combinedTopicName: { type: String, required: true }
  },
  { timestamps: true, collection: 'topic_metadata' }
)

topicMetadataSchema.index({ combinedTopicName: 1 }, { unique: true })

export const TopicMetadata = model<TopicMetadataDocument>(
  'TopicMetadata',
  topicMetadataSchema
)

export interface UpdateTopicBodyParams {
  topicName: string
  subTopicName?: string
  description: string
  thumbnailURL?: string
}

export interface GetTopicsResponse {
  message: string
  topics?: TopicMetadataDocument[]
}
