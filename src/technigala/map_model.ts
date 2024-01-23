import mongoose, { Schema, model } from 'mongoose'

export interface topicToVideoMapDocument extends Document {
  topic: string
  videoIds: mongoose.Types.ObjectId[]
}

const topicToVideoMapSchema = new Schema<topicToVideoMapDocument>(
  {
    topic: { type: String, required: true },
    videoIds: { type: [Schema.Types.ObjectId], required: true }
  },
  { timestamps: true, collection: 'topic_to_video_map' }
)

export const topicToVideoMap = model<topicToVideoMapDocument>(
  'topicToVideoMap',
  topicToVideoMapSchema
)
