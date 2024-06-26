import WatchHistory from '../models/watch_history_models'
import { VideoMetadata } from '../models/video_models'
import UserModel from '../models/user_model'
import { allTopics } from '../utils/topics'
import UserAffinityModel, {
  AffinityObject,
  MAX_ACTIVE_AFFINITIES
} from '../models/user_affinity_model'
import VideoAffinityModel from '../models/video_affinity_model'
import { generateVideoAffinities } from './video_affinity_controller'
import { ClipMetadata } from '../models/clip_models'
import { logger } from '../services/logger'

export const getWatchHistories = async (user, queryParameters) => {
  try {
    const {
      'date.gt': dateGt,
      'date.lt': dateLt,
      limit: queryLimit
    } = queryParameters
    const limit = queryLimit ? parseInt(queryLimit) : 500

    let query: any = { userId: user.id }

    const dateFilter: { $gte?: Date; $lt?: Date } = {
      ...(dateGt ? { $gte: new Date(dateGt) } : {}),
      ...(dateLt ? { $lt: new Date(dateLt) } : {})
    }

    if (dateGt || dateLt) {
      query.date = dateFilter
    }

    // query limit
    const watchHistory = await WatchHistory.find(
      query,
      { _id: 0, __v: 0 },
      { sort: { date: -1 }, limit: limit }
    )

    return watchHistory
  } catch (error) {
    throw new Error(`Error getting watch history: ${error}`)
  }
}

export const getWatchHistory = async (user, { videoId }) => {
  try {
    // Find the watch history for the specific user
    const watchHistory = await WatchHistory.findOne({
      userId: user.id,
      videoId: videoId
    })

    if (!watchHistory) {
      throw new Error('Watch history not found')
    }

    return watchHistory
  } catch (error) {
    throw new Error(`Error getting watch history: ${error}`)
  }
}

export const insertWatchHistory = async (
  user,
  { videoId },
  { clipId, duration }
) => {
  try {
    const watchHistory = await WatchHistory.findOne({
      userId: user.id,
      videoId: videoId
    })

    if (watchHistory) {
      // Update the date
      watchHistory.date = new Date()
      watchHistory.duration = duration
      watchHistory.clipId = clipId
      await watchHistory.save()
      return watchHistory
    }

    const newWatchHistory = new WatchHistory({
      userId: user.id,
      date: new Date(),
      videoId: videoId,
      duration: duration,
      clipId: clipId
    })

    await newWatchHistory.save()
    return newWatchHistory
  } catch (error) {
    throw new Error(`Error inserting watch history: ${error}`)
  }
}

export const removeWatchHistory = async (user, { videoId }) => {
  try {
    const watchHistory = await WatchHistory.findOne({
      userId: user.id,
      videoId: videoId
    })

    if (!watchHistory) {
      throw new Error('Watch history does not exist')
    }

    await watchHistory.deleteOne({ _id: watchHistory._id })

    return true
  } catch (error) {
    throw new Error(`Error removing watch history: ${error}`)
  }
}

export const removeAllWatchHistory = async (user) => {
  try {
    const watchHistory = await WatchHistory.find({ userId: user.id })

    if (!watchHistory) {
      throw new Error('Watch history does not exist')
    }

    await WatchHistory.deleteMany({ userId: user.id })

    return true
  } catch (error) {
    throw new Error(`Error removing all watch history: ${error}`)
  }
}

export const adminGetWatchHistories = async ({ userId }, query) => {
  try {
    const user = await UserModel.findById(userId)

    if (!user) {
      throw new Error('User not found')
    }

    return getWatchHistories(user, query)
  } catch (error) {
    throw new Error(`Error getting watch history: ${error}`)
  }
}

const findTopics = async (watchHistory) => {
  let topics = []
  for (let item of watchHistory) {
    let video = item.videoId
    let videoMeta = await VideoMetadata.findById(video)
    if (videoMeta) {
      for (let topic of videoMeta.topicId) {
        if (topics.indexOf(topic) == -1) {
          topics.push(topic)
        }
      }
    } else {
      throw new Error('No video found with given ID')
    }
  }
  return topics
}

export const getStatistics = async (user) => {
  try {
    const isUser = await UserModel.findById(user.id)
    if (!isUser) {
      throw new Error('User not found')
    }
    let todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    let midnight = new Date(todayDate.getTime())
    let weekDate = new Date(todayDate.setDate(todayDate.getDate() - 7))
    todayDate = new Date()

    const todayParams = {
      'date.gt': midnight,
      'date.lt': todayDate,
      limit: 500
    }
    const weekParams = { 'date.gt': weekDate, 'date.lt': todayDate, limit: 500 }
    const allParams = { 'date.gt': null, 'date.lt': todayDate, limit: 500 }
    let todayHistory = await getWatchHistories(user, todayParams)
    let weekHistory = await getWatchHistories(user, weekParams)
    let allHistory = await getWatchHistories(user, allParams)
    let todayTopics = await findTopics(todayHistory)
    let weekTopics = await findTopics(weekHistory)
    let allTopics = await findTopics(allHistory)

    let statistics = {
      statistics: [
        { value: `${todayTopics.length}`, item: 'topics', timeframe: 'today' },
        {
          value: `${weekTopics.length}`,
          item: 'topics',
          timeframe: 'this week'
        },
        { value: `${allTopics.length}`, item: 'topics', timeframe: 'total' }
      ]
    }

    return statistics
  } catch (error) {
    throw new Error(error)
  }
}

export const getRecentTopics = async (user) => {
  try {
    const isUser = await UserModel.findById(user.id)
    if (!isUser) {
      throw new Error('User not found')
    }
    const params = { 'date.gt': null, 'date.lt': new Date(), limit: 5 }
    let history = await getWatchHistories(user, params)
    let watchedTopics = await findTopics(history)
    let topics = []

    for (let topic of watchedTopics) {
      topics.push({ topicId: topic, topicName: allTopics[topic] })
    }

    return { topics: topics }
  } catch (error) {
    throw new Error(error)
  }
}

//// Updating Active User affinity
// Really the only thing that we need is the modifier and the current video. They accrew modifer
//   percent based on the retention on the clip.
// 1. Extend active affinities if theres space, evict oldest if not.
// 2. Scale affinities based on duration, if any clip duration exceeds 60%, they should have 80%
//    of the modifier, they should never be able to exceed 100%

// Exponential Decay Weighting
// Retention Time Weighting

//// Updating Active Topics
// This is probably going to be useful for rec engine if outputs are weird.
// 1. Just add to the set of active topics. Most recent at end, reset topics as necessary.
export const updateAffinity = async (
  userId,
  videoId,
  clipId,
  duration: number
) => {
  const userAffinity = await UserAffinityModel.findOne({ userId })
  const videoAffinity = await VideoAffinityModel.findOne({ videoId })
  const video = await VideoMetadata.findById(videoId)
  const clip = await ClipMetadata.findById(clipId)
  if (!videoAffinity) {
    generateVideoAffinities(videoId)
    const videoAffinity = await VideoAffinityModel.findOne({ videoId })
  }
  if (!userAffinity) {
    throw new Error('User affinity not found')
  }
  if (!video) {
    throw new Error('Video not found')
  }
  if (!clip) {
    throw new Error('Clip not found')
  }

  var newAffinity = {} as AffinityObject
  const old_modifier =
    userAffinity.activeAffinities.find(
      (affinity) => affinity.videoId == videoId
    )?.modifier || 0
  logger.debug(`Old Modifier: ${old_modifier}`)
  if (duration / clip.duration > 0.6 && old_modifier < 0.8) {
    newAffinity['modifier'] = 0.8
  }
  const new_modifier = 0.2 * (duration / Math.min(video.duration, 100))

  newAffinity['modifier'] = Math.min(new_modifier + old_modifier, 1) // Limit scalar to 100%

  newAffinity['videoId'] = videoId
  newAffinity['timestamp'] = Date.now()

  // Update active affinities
  const activeAffinities = userAffinity.activeAffinities
  const index = activeAffinities.findIndex(
    (affinity) => affinity.videoId == videoId
  )
  // Update active topics if topicId doesnt exist
  for (let topicId of video.topicId) {
    if (!userAffinity.activeTopics.includes(topicId)) {
      userAffinity.activeTopics.push(topicId)
    }
  }
  for (let topicId of video.inferenceTopicIds) {
    if (!userAffinity.activeTopics.includes(topicId)) {
      userAffinity.activeTopics.push(topicId)
    }
  }
  logger.debug(index)
  if (index == -1) {
    await userAffinity.updateOne({
      $push: {
        activeAffinities: {
          $each: [newAffinity],
          $sort: { timestamp: 1 }, // Ascending sort means older entries first
          $slice: -(MAX_ACTIVE_AFFINITIES - 1) // Keep only the last (most recent) 10 items
        }
      }
    })
  } else {
    userAffinity.activeAffinities[index] = newAffinity // If matching videoId, update affinity
  }

  // save affinity
  const savedUserAffinity = await userAffinity.save()
  return savedUserAffinity
}
