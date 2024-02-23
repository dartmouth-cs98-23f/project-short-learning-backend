import mongoose, { Schema } from 'mongoose'

const VideoAffinitySchema = new Schema(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'VideoMetadata',
      required: true
    },
    affinities: {
      type: [Number],
      set: function(values) {
        const uniqueValues = [...new Set(values)];
        return uniqueValues;
      }
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
  }
)

const VideoAffinityModel = mongoose.model('VideoAffinity', VideoAffinitySchema)

export default VideoAffinityModel
