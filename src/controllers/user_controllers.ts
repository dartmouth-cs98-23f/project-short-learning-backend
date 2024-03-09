import { Request, Response } from 'express'
import jwt from 'jwt-simple'
import User, { UserDocument } from '../models/user_model'
import UserAffinity from '../models/user_affinity_model'
import { VideoMetadata } from '../models/video_models'
import { sendEmail } from '../utils/sendEmail'
import UserModel from '../models/user_model'
import { logger } from '../services/logger'
import { Types } from 'mongoose'
import { indexedMap, allTopics } from '../utils/topics'
import { roleAffinities, roles } from '../utils/roles'
import { createUserAffinities } from './user_affinity_controller'

export const signin = (user) => {
  return tokenForUser(user)
}

export const signup = async ({
  firstName,
  lastName,
  email,
  username,
  password,
  birthDate
}) => {
  if (
    !email ||
    !password ||
    !username ||
    !firstName ||
    !lastName
    // !birthDate
  ) {
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
  user.firstName = firstName
  user.lastName = lastName
  user.email = email
  user.username = username
  user.password = password
  user.birthDate = new Date()
  user.registrationDate = new Date()
  user.lastLoginDate = new Date()
  user.onBoardingStatus = false
  await user.save()

  return tokenForUser(user)
}

function tokenForUser(user) {
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

export const savePlaylist = async (user, { playlistId, saved }) => {
  try {
    const userToSave = await User.findById(user.id)
    let videoIndex = userToSave.savedPlaylists.indexOf(playlistId)
    let playlist = new Types.ObjectId(playlistId)
    if (saved == true) {
      if (videoIndex == -1) {
        userToSave.savedPlaylists.push(playlist) // Update the array
      } else {
        throw new Error('Playlist to save already in list')
      }
    } else if (saved == false) {
      if (videoIndex !== -1) {
        userToSave.savedPlaylists.splice(videoIndex, 1) // Update the array
      } else {
        throw new Error('Playlist to delete is not in list')
      }
    } else {
      throw new Error('Invalid toSave boolean')
    }

    await userToSave.save() // Save the updated document
    return true
  } catch (error) {
    throw new Error(error)
  }
}

export const getSavedPlaylists = async (req: Request, res: Response) => {
  const userId = req.user.id

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found.');
    }

    const savedIds = user.savedPlaylists;

    // Map each ID to a video
    const saved = await Promise.all(
      savedIds.map(async (videoId) => {
        const metadata = await VideoMetadata.findById(videoId)
            .select('-clips')
            .exec()

          if (!metadata) {
            throw new Error(`Video with ${videoId} not found.`);
          }

          return metadata;
      })
    );

    return res.status(200).json({ playlists: saved })
  } catch (error) {
    logger.error(error)
    throw new Error(error)
  }
}

export const onboarding = async (user, body) => {
  try {
    const userId = user.id
    const roles: string[] = body.roles
    const values: number[] = body.values
    const topics: string[] = body.topics // TODO TOPICS:
    const complexity: number = body.complexity
    const userDoc = await User.findById(userId)
    // create doc if it doesnt exist, always remake when this is called

    const affinities = {}
    const complexities = {}

    for (const topic in allTopics) {
      affinities[topic] = 0
      complexities[topic] = complexity
    }

    for (let i = 0; i < roles.length; i++) {
      const role = roles[i]
      const value = values[i]
      const roleTopicScalars: Record<string, number> = roleAffinities[role]
      for (const topic in roleTopicScalars) {
        affinities[topic] += value * roleTopicScalars[topic]
        for (let j = 0; j < indexedMap[topic].length; j++) {
          affinities[indexedMap[topic][j]] += value * roleTopicScalars[topic]
        }
      }
    }

    // Scale to be between 0 and 1
    for (const topic in allTopics) {
      affinities[topic] = affinities[topic] / roles.length
      complexities[topic] = complexity
    }
    logger.silly(`User affinities: ${JSON.stringify(affinities)}`)

    // Load complexities for each topic to be equal to this base value
    // Load affinities for each topic to be based on their selected topic ()

    const savedUserAffinity = createUserAffinities(user, { affinities, complexities })
    return savedUserAffinity 
  } catch (error) {
    throw new Error(error)
  }
}
