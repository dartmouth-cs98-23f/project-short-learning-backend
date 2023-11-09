import { Schema, model, Document } from 'mongoose'

export interface TopicMetadataDocument extends Document {
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
    thumbnailURL: { type: String, required: true }
  },
  { timestamps: true, collection: 'topic_metadata' }
)

export const TopicMetadata = model<TopicMetadataDocument>(
  'TopicMetadata',
  topicMetadataSchema
)
