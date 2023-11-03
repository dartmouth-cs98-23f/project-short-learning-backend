import mongoose, { Schema } from 'mongoose';

const UserAffinitySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  affinities: {
    type: Map,
    of: Schema.Types.Number,
  },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
});

const UserAffinityModel = mongoose.model('UserAffinity', UserAffinitySchema);

export default UserAffinityModel;
