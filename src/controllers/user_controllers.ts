import jwt from 'jwt-simple'
import User, { UserDocument } from '../models/user_model'
import UserAffinity from '../models/user_affinity_model'
import { sendEmail } from '../utils/sendEmail'
import UserModel from '../models/user_model'
import { logger } from '../services/logger'
import { Types } from 'mongoose'
import { indexedMap, allTopics } from '../utils/topics'

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
        console.log('Adding to list')
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

let onboardingTopics = [
  'Algorithms',
  'UI/UX',
  'AI/ML',
  'Cybersecurity',
  'Mobile App Development',
  'Web Development',
  'Databases',
  'Networks',
  'Cloud',
  'Operating Systems',
  'Games',
  'Data Science',
  'Computer Vision',
  'Quantum Computing'
]

let roles = ['Frontend', 'Backend', 'ML', 'AI/Data', 'DevOps', 'QA']
let roleAffinities = {
  Frontend: {
    '1': 0.3,
    '7': 0.1,
    '13': 0.2,
    '19': 0.1,
    '25': 0.5,
    '31': 0.7,
    '37': 0.8,
    '43': 0.6,
    '49': 0.9,
    '55': 0.4,
    '61': 0.1,
    '67': 0.0
  },
  Backend: {
    '1': 0.6,
    '7': 0.2,
    '13': 0.4,
    '19': 0.3,
    '25': 0.8,
    '31': 0.3,
    '37': 0.9,
    '43': 0.8,
    '49': 0.7,
    '55': 0.2,
    '61': 0.4,
    '67': 0.1
  },
  ML: {
    '1': 0.5,
    '7': 0.9,
    '13': 0.2,
    '19': 0.8,
    '25': 0.3,
    '31': 0.2,
    '37': 0.6,
    '43': 0.5,
    '49': 0.1,
    '55': 0.4,
    '61': 0.7,
    '67': 0.2
  },
  'AI/Data': {
    '1': 0.4,
    '7': 0.9,
    '13': 0.1,
    '19': 0.9,
    '25': 0.4,
    '31': 0.2,
    '37': 0.5,
    '43': 0.4,
    '49': 0.1,
    '55': 0.3,
    '61': 0.8,
    '67': 0.2
  },
  DevOps: {
    '1': 0.4,
    '7': 0.1,
    '13': 0.6,
    '19': 0.2,
    '25': 0.7,
    '31': 0.3,
    '37': 0.8,
    '43': 0.9,
    '49': 0.5,
    '55': 0.2,
    '61': 0.3,
    '67': 0.1
  },
  QA: {
    '1': 0.7,
    '7': 0.2,
    '13': 0.3,
    '19': 0.4,
    '25': 0.5,
    '31': 0.6,
    '37': 0.9,
    '43': 0.8,
    '49': 0.6,
    '55': 0.4,
    '61': 0.5,
    '67': 0.1
  }
}

export const onboarding = async (user, body) => {
  try {
    const userId = user.id
    const roles: string[] = body.roles
    const values: number[] = body.values
    const topics: string[] = body.topics
    const complexity: number = body.complexity
    const userDoc = await User.findById(userId)
    // create doc if it doesnt exist
    const userAffinityDoc = await UserAffinity.findOne({ userId: userId })
    if (!userAffinityDoc) {
      const affinities = {}
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i]
        const value = values[i]
        const topics = roleAffinities[role]
    
      }

      const complexities = {}
      
      const newUserAffinity = new UserAffinity({
        userId: userId,
        affinities,
        complexities
      })
      await newUserAffinity.save()
    }
    // Load complexities for each topic to be equal to this base value
    // Load affinities for each topic to be based on their selected topic ()

    userDoc.onBoardingStatus = true

    // Fill in user affinity later
    await userDoc.save()
    return user
  } catch (error) {
    throw new Error(error)
  }
}
