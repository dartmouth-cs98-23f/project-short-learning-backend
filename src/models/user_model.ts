import mongoose, { Document, Schema } from 'mongoose'
import { arrayLimit } from '../utils/schema_validators'
import { Recommendation, recommendationSchema } from './recommendation_models'
var bcrypt = require('bcryptjs')

export interface UserDocument extends Document {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  birthDate: Date
  registrationDate: Date
  lastLoginDate: Date
  profilePicture: string
  onBoardingStatus: string
  emailVerificationCode: number
  isAdmin: boolean
  currentSequence: Recommendation[]
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<UserDocument>(
  {
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
      type: [recommendationSchema],
      required: true,
      validate: {
        validator: arrayLimit(10),
        message: 'CurrentVideos array must have at most 10 elements'
      }
    }
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
    collection: 'user'
  }
)

UserSchema.pre('save', async function beforeUserSave(next) {
  const user = this

  if (!user.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(7)
    const hash = await bcrypt.hash(user.password, salt)
    user.password = hash
    return next()
  } catch (error) {
    return next(error)
  }
})

UserSchema.methods.comparePassword = async function comparePassword(
  candidatePassword
) {
  const comparison = await bcrypt.compare(candidatePassword, this.password)
  return comparison
}

const UserModel = mongoose.model('User', UserSchema)

export default UserModel
