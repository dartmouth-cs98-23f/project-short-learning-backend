import mongoose from 'mongoose'
import { VideoMetadata, VideoMetadataDocument } from '../models/video_models'
import { logger } from '../services/logger'
import UserModel, { UserDocument } from '../models/user_model'
import { TopicMetadata, TopicMetadataDocument } from '../models/topic_models'
import {
  PrecomputedRecommendations,
  PrecomputedRecommendationsDocument
} from '../models/recommendation_models'

/**
 * Validates that a given playlist is in the database and if the videoIndex is valid
 *
 * @param playlistId
 * @param videoIndex or 0 if not provided
 */
export const validatePlaylist = async (
  playlistId: mongoose.Types.ObjectId,
  videoIndex: number = 0
): Promise<boolean> => {
  try {
    const playlist: VideoMetadataDocument =
      await VideoMetadata.findById(playlistId)
    if (!playlist) {
      throw new Error('Playlist not found')
    }
    if (videoIndex >= playlist.clips.length) {
      throw new Error('Video index out of bounds')
    }
    return true
  } catch (error) {
    logger.warn('Validation Middleware Error: ' + error)
    return false
  }
}

/**
 * Validates a sequence of playlists
 * 
 * @param playlistIds 
 * @returns 
 */

export const validateSequence = async (
  playlistIds: mongoose.Types.ObjectId[]
): Promise<boolean> => {
  try {
    for (const playlistId of playlistIds) {
      if (!(await validatePlaylist(playlistId))) {
        throw new Error('Playlist not found')
      }
    }
    return true
  } catch (error) {
    logger.warn('Validation Middleware Error: ' + error)
    return false
  }
}

/**
 * Validates that a given user is in the database
 */
export const validateUser = async (
  userId: mongoose.Types.ObjectId
): Promise<boolean> => {
  try {
    const user: UserDocument = await UserModel.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    return true
  } catch (error) {
    logger.warn('Validation Middleware Error: ' + error)
    return false
  }
}

/**
 * Validates that a given precomputed recommendation is in the database
 */
export const validatedPrecomputedRecommendations = async (
  userId: mongoose.Types.ObjectId
): Promise<PrecomputedRecommendationsDocument | boolean> => {
  try {
    if (!validateUser(userId)) {
      throw new Error('User not found')
    }
    const precomputedRecommendations = await PrecomputedRecommendations.findOne(
      {
        userId: userId
      }
    )
    if (!precomputedRecommendations) {
      throw new Error('Precomputed recommendations not found')
    }
    return precomputedRecommendations
  } catch (error) {
    logger.warn('Validation Middleware Error: ' + error)
    return false
  }
}

/**
 * Validates that a topic is in the database by combinedTopicName
 */
export const validateCombinedTopicName = async (
  combinedTopicName: string
): Promise<TopicMetadataDocument | boolean> => {
  try {
    const topic: TopicMetadataDocument = await TopicMetadata.findOne({
      combinedTopicName: combinedTopicName
    })
    if (!topic) {
      throw new Error('Topic not found')
    }
    return topic
  } catch (error) {
    logger.warn('Validation Middleware Error: ' + error)
    return false
  }
}

/**
 * Validates a topicId is in the database
 * 
 * @param topicId 
 * @returns 
 */
export const validateTopicId = async (
  topicId: mongoose.Types.ObjectId
): Promise<TopicMetadataDocument | boolean> => {
  try {
    const topic: TopicMetadataDocument = await TopicMetadata.findById(topicId)
    if (!topic) {
      throw new Error('Topic not found')
    }
    return topic
  } catch (error) {
    logger.warn('Validation Middleware Error: ' + error)
    return false
  }
}