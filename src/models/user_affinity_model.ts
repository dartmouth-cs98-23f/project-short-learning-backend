import mongoose, { Schema } from 'mongoose'

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

const UserAffinitySchema = new Schema<UserAffinityDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    affinities: { type: Map, of: Number, required: false },
    complexities: { type: Map, of: Number, required: false },
    activeAffinities: [
      {
        affinities: { type: Map, of: Number, required: false },
        timestamp: { type: Number, required: false }
      }
    ]
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
