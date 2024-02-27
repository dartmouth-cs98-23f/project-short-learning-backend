import mongoose, { Schema } from 'mongoose'

const VideoAffinitySchema = new Schema(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'VideoMetadata',
      required: true
    },
    affinities: { type: Map, of: Number, required: false },
    complexities: { type: Map, of: Number, required: false },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
  }
)

const VideoAffinityModel = mongoose.model('VideoAffinity', VideoAffinitySchema)

export default VideoAffinityModel
