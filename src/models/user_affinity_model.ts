import mongoose, { Schema } from 'mongoose'

const UserAffinitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

const UserAffinityModel = mongoose.model('UserAffinity', UserAffinitySchema)

export default UserAffinityModel