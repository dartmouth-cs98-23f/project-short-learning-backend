import { Request, Response } from 'express'
import {
  GetPlaylistQueryParams,
  GetPrecomputedQueryParams,
  PrecomputedRecommendations,
  PrecomputedRecommendationsDocument,
  UpdatePrecomputedBodyParams
} from '../models/recommendation_models'
import { logger } from '../services/logger'
import { VideoMetadata, VideoMetadataDocument } from '../models/video_models'
import mongoose from 'mongoose'
import {
  validateCombinedTopicName,
  validateSequence,
  validateUser
} from '../utils/param_validators'
import {
  GetTopicsResponse,
  TopicMetadata,
  TopicMetadataDocument
} from '../models/topic_models'

export const getPrecomputedRecommendationDocument = async (
  req: Request<{}, {}, {}, GetPrecomputedQueryParams>,
  res: Response
) => {
  const userId = req.query.userId

  const recommendationMetadata = await PrecomputedRecommendations.findOne({
    userId: userId
  })

  if (!recommendationMetadata) {
    return res.status(404).json({ message: 'Recommendations not found' })
  }

  logger.debug(`Found recommendations for user: ' + ${userId}`)
  logger.debug(recommendationMetadata)

  return res
    .status(200)
    .json({ message: 'Success', recommendation: recommendationMetadata })
}

// Validate userId, combinedTopicName, and recommendations in middleware
export const updatePrecomputedRecommendation = async (
  req: Request<{}, {}, UpdatePrecomputedBodyParams>,
  res: Response
) => {
  try {
    const userId = req.body.userId as any as mongoose.Types.ObjectId
    const combinedTopicName = req.body.combinedTopicName
    const recommendations = req.body
      .recommendations as any as mongoose.Types.ObjectId[]

    if (!(await validateUser(userId))) {
      return res.status(422).json({ message: 'Invalid userId' })
    } else if (!(await validateCombinedTopicName(combinedTopicName))) {
      logger.debug(`Invalid combinedTopicName: ${combinedTopicName}`)
      return res.status(422).json({ message: 'Invalid combinedTopicName' })
    } else if (!(await validateSequence(recommendations))) {
      return res.status(422).json({ message: 'Invalid recommendations' })
    }

    const exists = await PrecomputedRecommendations.findOne({
      userId
    })

    // Create new document if it doesn't exist
    if (!exists) {
      logger.debug(
        `Creating new precomputed recommendations for user: ' + ${userId}`
      )
      const newPrecomputedRecommendations =
        await PrecomputedRecommendations.create({
          userId: userId,
          topicSequences: new Map()
        })
    }

    const recommendationMetadata = await PrecomputedRecommendations.findOne({
      userId
    })

    recommendationMetadata.topicSequences.set(
      combinedTopicName,
      recommendations
    )
    await recommendationMetadata.save()

    logger.debug(recommendationMetadata)
    return res
      .status(200)
      .json({ message: 'Success', metadata: recommendationMetadata })
  } catch (err) {
    logger.error(`Something failed: ${err}`)
    return res.status(500).json({ message: 'Server Error' })
  }
}

export const deletePrecomputedRecommendations = async (
  req: Request<{}, {}, PrecomputedRecommendationsDocument>,
  res: Response
) => {
  const userId = req.body.userId

  if (!userId) {
    return res.status(422).json({ message: 'Missing { userId }' })
  }

  const recommendationMetadata =
    await PrecomputedRecommendations.findOneAndDelete({
      userId: userId
    })

  if (!recommendationMetadata) {
    return res
      .status(404)
      .json({ message: 'Precomputed recommendations not found' })
  }

  logger.debug(`Deleted precomputed recommendations for user: ' + ${userId}`)

  return res
    .status(200)
    .json({ message: 'Success, precomputed recommendations deleted' })
}

export const getPlaylistRecommendation = async (
  req: Request<{}, {}, {}, GetPlaylistQueryParams>,
  res: Response
) => {
  const userId = req.user
  const combinedTopicName = req.query.combinedTopicName
  const topicId = req.query.topicId
  const numPlaylists =
    req.query.numPlaylists > 10 ? 10 : req.query.numPlaylists || 1

  var recommendationArray

  logger.debug(
    `Getting new playlist for user: ' + ${userId}, topic: ${combinedTopicName}, numPlaylists: ${numPlaylists}`
  )

  const precomputedRecommendationsDocument: PrecomputedRecommendationsDocument =
    await PrecomputedRecommendations.findOne({
      userId: userId
    })
  if (!precomputedRecommendationsDocument) {
    logger.warn(`No precomputed document for user: ' + ${userId}`)
    return res.status(404).json({ message: 'Recommendations not found' })
  }

  if (topicId) {
    const topicMetadata: TopicMetadataDocument =
      await TopicMetadata.findById(topicId)
    if (!topicMetadata) {
      logger.warn(`No topic found for user: ' + ${userId}, topic: ${topicId}`)
      return res.status(404).json({ message: 'Recommendations not found' })
    }
    recommendationArray = precomputedRecommendationsDocument.topicSequences.get(
      topicMetadata.combinedTopicName
    )
  } else if (combinedTopicName) {
    recommendationArray =
      precomputedRecommendationsDocument.topicSequences.get(combinedTopicName)
  } else {

    recommendationArray = precomputedRecommendationsDocument.topicSequences.get(
      precomputedRecommendationsDocument.topicSequences.keys().next().value
    )
  }

  if (!recommendationArray) {
    logger.warn(
      `No topic found for user: ' + ${userId}, topic: ${combinedTopicName}`
    )
    return res.status(404).json({ message: 'Recommendations not found' })
  }

  logger.debug(
    `Found recommendations for user: ' + ${userId}, topic: ${combinedTopicName}`
  )

  const playlistIds = recommendationArray.splice(0, numPlaylists)

  const sequence = []
  logger.debug(`playlistIds: ${playlistIds}`)

  for (var i = 0, len = playlistIds.length; i < len; i++) {
    const playlist: VideoMetadataDocument = await VideoMetadata.findById(
      playlistIds[i]
    )
      .populate('clips')
      .exec()
    if (!playlist) {
      logger.warn(`No playlist found playlistID: ${playlistIds[i]}`)
    } else {
      logger.debug(`found ${playlist.title}`)
      sequence.push(playlist)
    }
  }

  logger.debug(`sequence: ${sequence.length}, numPlaylists: ${numPlaylists}`)
  if (sequence.length != numPlaylists) {
    return res.status(200).json({
      message: 'Success, but could not find all playlists or too many queried',
      playlists: sequence
    })
  }

  return res.status(200).json({
    message: 'Success',
    playlists: sequence
  })
}

export const getTopicsRecommendation = async (
  req: Request,
  res: Response<GetTopicsResponse>
) => {
  try {
    const userId = req.user

    const precomputedRecommendationsDocument: PrecomputedRecommendationsDocument =
      await PrecomputedRecommendations.findOne({
        userId: userId
      })

    if (!precomputedRecommendationsDocument) {
      logger.warn(`No precomputed document for user: ' + ${userId}`)
      return res.status(404).json({ message: 'Recommendations not found' })
    }

    const topicSequences: Map<string, mongoose.Types.ObjectId[]> =
      precomputedRecommendationsDocument.topicSequences
    const topics = []

    const it = topicSequences.keys()
    // TEMP: max 10 topics
    for (var i = 0; i < 10; i++) {
      const topicName = it.next().value

      if (topicName === undefined) {
        break
      }

      const topicMetadata: TopicMetadataDocument = await TopicMetadata.findOne({
        combinedTopicName: topicName
      })
      if (!topicMetadata) {
        logger.warn(
          `No topic found for user: ' + ${userId}, topic: ${topicName}`
        )
      }
      topics.push(topicMetadata)
    }

    return res.status(200).json({
      message: 'Success',
      topics
    })
  } catch (error) {
    logger.error(`Something failed: ${error}`)
    return res.status(500).json({ message: 'Server Error' })
  }
}
