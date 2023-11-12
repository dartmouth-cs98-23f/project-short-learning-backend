import mongoose, { Schema, model, Document } from 'mongoose'
import { arrayLimit } from '../utils/schema_validators'

// May deal with scaling issues with a document per user per topic, 

export interface PrecomputedRecommendationsDocument extends Document {
  userId: mongoose.Types.ObjectId
  topicSequences: Map<string, mongoose.Types.ObjectId[]>
}

const precomputedRecommendationsSchema = new Schema<PrecomputedRecommendationsDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    topicSequences: {
      type: Map,
      of: [{ type: Schema.Types.ObjectId, ref: 'VideoMetadata' }],
      required: true,
    }
  },
  { timestamps: true, collection: 'precomputed_recommendations' }
)

precomputedRecommendationsSchema.index({ userId: 1 }, { unique: true })

export const PrecomputedRecommendations =
  model<PrecomputedRecommendationsDocument>(
    'PrecomputedRecommendations',
    precomputedRecommendationsSchema
  )
export interface GetPrecomputedQueryParams {
  userId: string
}

export interface GetPlaylistQueryParams {
  combinedTopicName?: string
  topicId?: string
  numPlaylists?: number
}

export interface UpdatePrecomputedBodyParams {
  userId: string
  combinedTopicName: string
  recommendations: string[]
}