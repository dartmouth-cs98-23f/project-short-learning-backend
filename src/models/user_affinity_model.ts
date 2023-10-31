import mongoose, { Schema } from 'mongoose';

const UserAffinitySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  subTopic: { type: String, required: true },
  affinityValue: { type: Number, required: true },
  affinityRank: { type: Number },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
});

const UserAffinityModel = mongoose.model('UserAffinity', UserAffinitySchema);

export default UserAffinityModel;
