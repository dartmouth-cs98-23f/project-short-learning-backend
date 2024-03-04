import mongoose, { Schema } from 'mongoose'

const MAX_ACTIVE_AFFINITIES = 10

export interface AffinityObject {
  affinities: Record<string, number>
  timestamp: number
}
export interface UserAffinityDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  affinities: Map<string, number>
  complexities: Map<string, number>
  activeAffinities: AffinityObject[]
}

export interface AffinityObject {
  affinities: Record<string, number>
  timestamp: number
}
export interface UserAffinityDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  affinities: Map<string, number>
  complexities: Map<string, number>
  activeAffinities: AffinityObject[]
}

const UserAffinitySchema = new Schema<UserAffinityDocument><UserAffinityDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    affinities: { type: Map, of: Number, required: false },
    complexities: { type: Map, of: Number, required: false },
    activeAffinities: {
      type: [
        {
          affinities: { type: Map, of: Number, required: true },
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
