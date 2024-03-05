import UserAffinityModel from '../models/user_affinity_model'
import UserAffinity from '../models/user_affinity_model'
import UserModel from '../models/user_model'
import VideoAffinityModel from '../models/video_affinity_model'
import { VideoMetadata } from '../models/video_models'
import { logger } from '../services/logger'
import { generateVideoAffinities } from './video_affinity_controller'

// import the list of strings from src\utils\affinityTruthTable and make it a truth table for the affinity topics
const fs = require('fs')

const fileContent = fs.readFileSync('src/utils/affinityTruthTable', 'utf8')
const affinitiesTruthTable = fileContent.split(/[\r\n]+/)

export const createUserAffinities = async (
  user,
  { affinities, complexities }
) => {
  try {
    const existingUserAffinity = await UserAffinity.findOne({
      userId: user._id
    })
    var userAffinity = new UserAffinity({
      userId: user._id,
      affinities: {},
      complexities: {}
    })
    if (existingUserAffinity) {
      userAffinity = existingUserAffinity
    }

    if (affinities) {
      for (const [key, value] of Object.entries(affinities)) {
        if (!affinitiesTruthTable.includes(key)) {
          throw new Error(`Invalid topic ID: ${key}`)
        }
        if (typeof value !== 'number') {
          throw new Error(
            `Expected a number for affinity value, but got a ${typeof value}`
          )
        }
        if (value < 0 || value > 1) {
          throw new Error(`Invalid affinity value: ${value}`)
        }
        userAffinity.affinities.set(key, value)
      }
    }

    if (complexities) {
      for (const [key, value] of Object.entries(complexities)) {
        if (!affinitiesTruthTable.includes(key)) {
          throw new Error(`Invalid topic ID: ${key}`)
        }
        if (typeof value !== 'number') {
          throw new Error(
            `Expected a number for complexity value, but got a ${typeof value}`
          )
        }
        if (value < 0 || value > 1) {
          throw new Error(`Invalid complexity value: ${value}`)
        }
        userAffinity.complexities.set(key, value)
      }
    }

    const savedUserAffinity = await userAffinity.save()
    return savedUserAffinity
  } catch (error) {
    throw new Error(`Create user affinities error: ${error}`)
  }
}

export const getUserAffinities = async (user) => {
  try {
    const userAffinities = await UserAffinity.findOne({ userId: user._id })
    return userAffinities
  } catch (error) {
    throw new Error(`Get user affinities error: ${error}`)
  }
}

export const updateUserAffinities = async (
  user,
  { affinities, complexities }
) => {
  try {
    const userAffinity = await UserAffinity.findOne({ userId: user._id })
    if (!userAffinity) {
      throw new Error('User affinities not found')
    }

    if (affinities) {
      for (const [key, value] of Object.entries(affinities)) {
        if (!affinitiesTruthTable.includes(key)) {
          throw new Error(`Invalid topic ID: ${key}`)
        }
        if (typeof value !== 'number') {
          throw new Error(
            `Expected a number for affinity value, but got a ${typeof value}`
          )
        }
        if (value < 0 || value > 1) {
          throw new Error(`Invalid affinity value: ${value}`)
        }
        userAffinity.affinities.set(key, value)
      }
    }

    if (complexities) {
      for (const [key, value] of Object.entries(complexities)) {
        if (!affinitiesTruthTable.includes(key)) {
          throw new Error(`Invalid topic ID: ${key}`)
        }
        if (typeof value !== 'number') {
          throw new Error(
            `Expected a number for complexity value, but got a ${typeof value}`
          )
        }
        if (value < 0 || value > 1) {
          throw new Error(`Invalid complexity value: ${value}`)
        }
        userAffinity.complexities.set(key, value)
      }
    }

    const savedUserAffinity = await userAffinity.save()
    return savedUserAffinity
  } catch (error) {
    throw new Error(`Update user affinities error: ${error}`)
  }
}

export const deleteUserAffinities = async (user) => {
  try {
    const userAffinity = await UserAffinity.findOne({ userId: user._id })
    if (!userAffinity) {
      throw new Error('User affinities not found')
    }
    await UserAffinity.deleteOne(userAffinity._id)
    return true
  } catch (error) {
    throw new Error(`Delete user affinities error: ${error}`)
  }
}

export const adminGetUserAffinities = async ({ userId }) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    return getUserAffinities(user)
  } catch (error) {
    throw new Error(
      `Get user affinities with admin permissions error: ${error}`
    )
  }
}

/**
 * Used when a video is liked by a user. Automatically sets the affinity to 1.
 *
 * @param userId
 * @param videoId
 */
export const updateAffinityOnLike = async (userId, videoId) => {
  const userAffinity = await UserAffinityModel.findOne({ userId })
  const video = await VideoMetadata.findById(videoId)
  if (!userAffinity) {
    throw new Error('User affinity not found')
  }
  if (!video) {
    throw new Error('Video not found')
  }

  const activeAffinities = userAffinity.activeAffinities

  const index = activeAffinities.findIndex(
    (affinity) => affinity.videoId == videoId
  )
  const modifier = 1
  // Update Modifier to 1
  if (index == -1) {
    userAffinity.activeAffinities.push({
      modifier,
      videoId,
      timestamp: Date.now()
    })
  } else {
    userAffinity.activeAffinities[index].modifier = modifier
  }
  userAffinity.save()
  return userAffinity
}

export const updateAffinityOnDislike = async (userId, videoId) => {
  const userAffinity = await UserAffinityModel.findOne({ userId })
  const video = await VideoMetadata.findById(videoId)
  if (!userAffinity) {
    throw new Error('User affinity not found')
  }
  if (!video) {
    throw new Error('Video not found')
  }

  const activeAffinities = userAffinity.activeAffinities

  const index = activeAffinities.findIndex(
    (affinity) => affinity.videoId == videoId
  )
  const modifier = 0
  // Update Modifier to 0
  if (index == -1) {
    userAffinity.activeAffinities.push({
      modifier,
      videoId,
      timestamp: Date.now()
    })
  } else {
    userAffinity.activeAffinities[index].modifier = modifier
  }
  userAffinity.save()
  return userAffinity
}

export const updateAffinityOnTooHard = async (userId, videoId) => {
  const userAffinity = await UserAffinityModel.findOne({ userId })
  const video = await VideoMetadata.findById(videoId)
  if (!userAffinity) {
    throw new Error('User affinity not found')
  }
  if (!video) {
    throw new Error('Video not found')
  }

  const complexities = userAffinity.complexities

  // loop through all complexities and reduce them by 0.1, but not below 0
  for (const [key, value] of complexities) {
    if (value > 0) {
      complexities.set(key, Math.max(value - 0.1, 0))
    }
  }
  userAffinity.save()
  return userAffinity
}

export const updateAffinityOnTooEasy = async (userId, videoId) => {
  const userAffinity = await UserAffinityModel.findOne({ userId })
  const video = await VideoMetadata.findById(videoId)
  if (!userAffinity) {
    throw new Error('User affinity not found')
  }
  if (!video) {
    throw new Error('Video not found')
  }

  const complexities = userAffinity.complexities

  // loop through all complexities and increase them by 0.1, but not above 1
  for (const [key, value] of complexities) {
    if (value < 1) {
      complexities.set(key, Math.min(value + 0.1, 1))
    }
  }
  userAffinity.save()
  return userAffinity
  