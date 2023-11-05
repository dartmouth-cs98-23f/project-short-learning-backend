import mongoose, { Schema } from 'mongoose';
var bcrypt = require('bcryptjs');
import { arrayLimit } from '../utils/schema_validators';

export interface CurrentVideo {
  videoId: mongoose.Types.ObjectId
  index: number
  timestamp: Date
}

const currentVideoSchema = new Schema<CurrentVideo>(
  {
    videoId: { type: Schema.Types.ObjectId, required: true },
    index: { type: Number, required: true },
    timestamp: { type: Date, required: true }
  },
  { timestamps: true, collection: 'current_videos' }
)

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  username: { type: String, unique: true, lowercase: true },
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  birthDate: Date,
  registrationDate: { type: Date, default: Date.now },
  lastLoginDate: { type: Date, default: Date.now },
  profilePicture: String,
  onBoardingStatus: String,
  emailVerificationCode: { type: Number, select: false },
  isAdmin: { type: Boolean, default: false },
  currentSequence: {
    type: [currentVideoSchema],
    required: true,
    validate: {
      validator: arrayLimit(10),
      message: 'CurrentVideos array must have at most 10 elements'
    }
  }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
});

UserSchema.pre('save', async function beforeUserSave(next) {
  const user = this;

  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(7);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  const comparison = await bcrypt.compare(candidatePassword, this.password);
  return comparison;
};

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
