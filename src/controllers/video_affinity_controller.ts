import VideoAffinity from '../models/video_affinity_model'
import { VideoMetadata } from '../models/video_models'
import { logger } from '../services/logger'
import { allTopics } from '../utils/topics'

// import the list of strings from src\utils\affinityTruthTable and make it a truth table for the affinity topics
const fs = require('fs')

const fileContent = fs.readFileSync('src/utils/affinityTruthTable', 'utf8')
const affinitiesTruthTable = fileContent.split(/[\r\n]+/)

export const createVideoAffinity = async (
  videoId,
  { affinities, complexities }
) => {
  try {
    const video = await VideoMetadata.findById(videoId)
    if (!video) {
      throw new Error('Video not found')
    }

    const existingVideoAffinities = await VideoAffinity.findOne({
      videoId: videoId
    })

    if (existingVideoAffinities) {
      throw new Error('Video affinity already exists')
    }

    const videoAffinity = new VideoAffinity({
      videoId: video._id,
      affinities: {},
      complexities: {}
    })

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
        videoAffinity.affinities.set(key, value)
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
        videoAffinity.complexities.set(key, value)
      }
    }

    const savedVideoAffinity = await videoAffinity.save()

    return savedVideoAffinity
  } catch (error) {
    throw new Error(`Create video affinity error: ${error}`)
  }
}

export const getVideoAffinities = async (videoId) => {
  try {
    const video = await VideoMetadata.findById(videoId)
    if (!video) {
      throw new Error('Video not found')
    }

    const videoAffinity = await VideoAffinity.findOne({ videoId: videoId })
    return videoAffinity
  } catch (error) {
    throw new Error(`Get video affinities error: ${error}`)
  }
}

export const updateVideoAffinities = async (
  videoId,
  { affinities, complexities }
) => {
  try {
    const video = await VideoMetadata.findById(videoId)
    if (!video) {
      throw new Error('Video not found')
    }

    const videoAffinity = await VideoAffinity.findOne({ videoId: videoId })

    if (!videoAffinity) {
      throw new Error('Video affinities does not exists')
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
        videoAffinity.affinities.set(key, value)
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
        videoAffinity.complexities.set(key, value)
      }
    }

    const savedVideoAffinity = await videoAffinity.save()
    return savedVideoAffinity
  } catch (error) {
    throw new Error(`Update video affinities error: ${error}`)
  }
}

export const deleteVideoAffinities = async (videoId) => {
  try {
    const video = await VideoMetadata.findById(videoId)
    /*
    if (!video) {
      throw new Error('Video not found');
    }
    */

    const videoAffinity = await VideoAffinity.findOne({ videoId: videoId })

    if (!videoAffinity) {
      throw new Error('Video affinities does not exists')
    }

    await videoAffinity.deleteOne({ _id: videoAffinity._id })
    return true
  } catch (error) {
    throw new Error(`Delete video affinities error: ${error}`)
  }
}

/**
 * Generates a video affinity based on tags in MongoDB
 *
 * @param videoId
 * @returns
 */
export const generateVideoAffinities = async (videoId) => {
  // Im thinking that we should provide values of 1.0 to any of the labeled topics on the videos lets do
  //   this for both inference and yt labeled videos. This is a little worrying just because 1.0 is a
  //   strong measure. But if we account for this in our watch history affinity recalculation we should
  //   be fine.

  // 1. Translate topics in MongoDB to topicIds, remember that some parenthesis values are removed
  // 2. Relabel with new topicIds, probably add a new field to the video metadata model
  // 3. Generate affinities and complexities for the video, complexities should be from the model
  // 4. Save the video affinities
  try {
    const video = await VideoMetadata.findById(videoId)
    if (!video) {
      throw new Error('Video not found')
    }
    const videoAffinity = await VideoAffinity.findOne({ videoId: videoId })
    const affinities = {}
    const complexities = {}

    for (const topic in allTopics) {
      affinities[topic] = 0
      complexities[topic] = 0 // To be filled in later
    }

    video.topicId.forEach((topic) => {
      logger.info(`Topic: ${topic}`)
      affinities[topic] = 1.0
    })
    video.inferenceTopicIds.forEach((topic) => {
      affinities[topic] = 1.0
    })

    if (!videoAffinity) {
      createVideoAffinity(videoId, { affinities, complexities })
    } else {
      updateVideoAffinities(videoId, { affinities, complexities })
    }
  } catch (error) {
    throw new Error(`Generate video affinities error: ${error}`)
  }
}
