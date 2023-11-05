import mongoose, { Schema, model, Document } from 'mongoose'
import { arrayLimit } from '../utils/schema_validators'

// This needs to be reworked term 2 for sure.

export interface Recommendation {
  videoId: mongoose.Types.ObjectId
  clipIndex: number
  topicId: string
}

const recommendationSchema = new Schema<Recommendation>(
  {
    videoId: { type: Schema.Types.ObjectId, required: true },
    clipIndex: { type: Number, required: false },
    topicId: { type: String, required: false }
  },
  { timestamps: true, collection: 'recommendations' }
)

/**
 * PrecomputedRecommendations Model
 *
 * topVideoRecommendations are the videos that are recommended to the user
 * topTopicVideoRecommendations are the videos from their top topic that are recommended to the user
 * currentVideos // The list of videos that the user is currently watching
 *
 */
export interface PrecomputedRecommendationsDocument extends Document {
  userId: mongoose.Types.ObjectId
  topVideoRecommendations: Recommendation[]
  topTopicVideoRecommendations: Recommendation[]
}

const precomputedRecommendationsSchema =
  new Schema<PrecomputedRecommendationsDocument>(
    {
      userId: { type: Schema.Types.ObjectId, required: true },
      topVideoRecommendations: {
        type: [recommendationSchema],
        required: true,
        validate: {
          validator: arrayLimit(10),
          message: 'Recommendations array must have at most 10 elements'
        }
      },
      topTopicVideoRecommendations: {
        type: [recommendationSchema],
        required: true,
        validate: {
          validator: arrayLimit(10),
          message: 'Recommendations array must have at most 10 elements'
        }
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

export interface GetNewRecommendationBodyParams {
  userId: mongoose.Types.ObjectId
  isSkip: boolean
}
