import jwt from 'jwt-simple'
import User, { UserDocument } from '../models/user_model'
import UserAffinity from '../models/user_affinity_model'
import { sendEmail } from '../utils/sendEmail'
import UserModel from '../models/user_model'
import { randomUUID } from 'crypto'
import { logger } from '../services/logger'

export const signin = (user) => {
  return [tokenForUser(user), user]
}

export const signup = async ({
  firstName,
  lastName,
  email,
  username,
  password,
  birthDate
}) => {
  logger.debug("asd")
  if (!email || !password) {
    throw new Error('Incomplete information provided')
  }
  // See if a user with the given email exists
  const existingEmail = await User.findOne({ email })
  if (existingEmail) {
    // If a user with email does exist, return an error
    throw new Error('Email is in use')
  }
  const existingUsername = await User.findOne({ username })
  if (existingUsername) {
    // If a user with same username does exist, return an error
    throw new Error('Username is in use')
  }

  const user = new User()
  user.firstName = firstName || randomUUID()
  user.lastName = lastName || randomUUID()
  user.email = email
  user.username = username || randomUUID()
  user.password = password
  user.birthDate = new Date()
  user.registrationDate = new Date()
  user.lastLoginDate = new Date()
  user.onBoardingStatus = 'onboarding'
  await user.save()

  return tokenForUser(user)
}

export function tokenForUser(user) {
  const timestamp = new Date().getTime()
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET)
}

export const sendVerificationEmail = async (user) => {
  try {
    if (!user.onBoardingStatus || user.onBoardingStatus === 'verifying') {
      user.emailVerificationCode = Math.floor(100000 + Math.random() * 900000)
      await user.save()
      await sendEmail(user)
      return true
    } else {
      throw new Error('User is already verified')
    }
  } catch (error) {
    throw new Error(`Resend verification email error: ${error}`)
  }
}

export const getUser = async (user) => {
  try {
    return user
  } catch (error) {
    throw new Error(error)
  }
}

export const updateUser = async (
  user,
  {
    firstName,
    lastName,
    email,
    username,
    password,
    newPassword,
    birthDate,
    profilePicture,
    onBoardingStatus
  }
) => {
  try {
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (email) user.email = email
    if (username) user.username = username
    if (password && newPassword) {
      if (password === newPassword)
        throw new Error('New password cannot be the same as old password')
      user.password = newPassword
    }
    if (birthDate) user.birthDate = birthDate
    if (profilePicture) user.profilePicture = profilePicture
    if (onBoardingStatus) user.onBoardingStatus = onBoardingStatus

    const updatedUser = await user.save()
    return updatedUser
  } catch (error) {
    throw new Error(error)
  }
}

export const deleteUser = async (user) => {
  try {
    const affinitiesAssociatedWithUser = await UserAffinity.find({
      userId: user._id
    })
    for (const affinity of affinitiesAssociatedWithUser) {
      await UserAffinity.deleteOne({ _id: affinity._id })
    }

    const deletedUser = User.deleteOne({ _id: user._id })
    return deletedUser
  } catch (error) {
    throw new Error(error)
  }
}

export const verifyUser = async (user, { emailVerificationCode }) => {
  try {
    const userWithEmailVerificationCode = await User.findById(user.id).select(
      '+emailVerificationCode'
    )
    if (user.onBoardingStatus && user.onBoardingStatus !== 'verifying') {
      throw new Error('User is already verified')
    }
    if (
      userWithEmailVerificationCode.emailVerificationCode ===
      emailVerificationCode
    ) {
      user.onBoardingStatus = 'tutorial'
      await user.save()
      return true
    } else {
      throw new Error('Invalid verification token')
    }
  } catch (error) {
    throw new Error(error)
  }
}
