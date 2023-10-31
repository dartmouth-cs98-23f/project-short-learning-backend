import mongoose, { Schema } from 'mongoose';

const UserAffinitySchema = new Schema({
  userId: { type: String, ref: 'Users', required: true },
  topic: { type: String, required: true },
  subTopic: { type: String, required: true },
  affinityValue: { type: Number, required: true },
  affinityRank: { type: Number },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
});

const UserAffinityModel = mongoose.model('UserAffinities', UserAffinitySchema);

export default UserAffinityModel;
