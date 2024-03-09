import mongoose, { Schema } from 'mongoose'
import { allTopics } from '../utils/topics'
import { logger } from '../services/logger'

export const MAX_ACTIVE_AFFINITIES = 10

export interface AffinityObject {
  modifier: number
  videoId: mongoose.Types.ObjectId
  timestamp: number
}

export interface UserAffinityDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  affinities: Map<string, number>
  complexities: Map<string, number>
  activeAffinities: AffinityObject[]
  activeTopics: Number[]
}

const UserAffinitySchema = new Schema<UserAffinityDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    affinities: { type: Map, of: Number, required: false },
    complexities: { type: Map, of: Number, required: false },
    activeAffinities: {
      type: [
        {
          modifier: { type: Number, required: true },
          videoId: { type: Schema.Types.ObjectId, required: true },
          timestamp: { type: Number, required: true }
        }
      ],
      required: false,
      validate: {
        validator: function (v: AffinityObject[]) {
          return v.length <= MAX_ACTIVE_AFFINITIES
        },
        message: `Active affinities array cannot be longer than ${MAX_ACTIVE_AFFINITIES}`
      }
    },
    activeTopics: {
      type: [Number],
      required: false,
      validate: {
        validator: function (v: Number[]) {
          return v.every((topic) => allTopics[topic.toString()])
        },
        message: 'Active topics must be valid'
      }
    }
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
  }
)

UserAffinitySchema.index({ userId: 1 }, { unique: true })

const UserAffinityModel = mongoose.model('UserAffinity', UserAffinitySchema)

export default UserAffinityModel
