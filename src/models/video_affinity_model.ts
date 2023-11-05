import mongoose, { Schema } from 'mongoose'

const VideoAffinitySchema = new Schema(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'VideoMetadata',
      required: true
    },
    affinities: {
      type: Map,
      of: Schema.Types.Number
    }
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
  }
)

const VideoAffinityModel = mongoose.model('VideoAffinity', VideoAffinitySchema)

export default VideoAffinityModel
