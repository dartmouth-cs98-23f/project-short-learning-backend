import { Request, Response } from 'express'
import {
  PrecomputedRecommendations,
  PrecomputedRecommendationsDocument
} from '../models/recommendation_models'
import { logger } from '../services/logger'
import { validatePrecomputedRecommendations } from '../utils/endpoints/param_validator'

export const getPrecomputedRecommendations = async (
  req: Request<{}, {}, PrecomputedRecommendationsDocument>,
  res: Response
) => {
  const userId = req.body.userId
  if (!userId) {
    return res.status(422).json({ message: 'Missing userId' })
  }

  const recommendations = await PrecomputedRecommendations.findOne({
    userId: userId
  })

  if (!recommendations) {
    return res.status(404).json({ message: 'Recommendations not found' })
  }

  logger.debug(`Found recommendations for user: ' + ${userId}`)

  return res
    .status(200)
    .json({ message: 'Success', recommendations: recommendations })
}

export const updatePrecomputedRecommendations = async (
  req: Request<{}, {}, PrecomputedRecommendationsDocument>,
  res: Response
) => {
  const precomputedRecommendationsBodyParams: PrecomputedRecommendationsDocument =
    req.body

  const userId = precomputedRecommendationsBodyParams.userId
  const topTopicVideoRecommendations =
    precomputedRecommendationsBodyParams.topTopicVideoRecommendations
  const topVideoRecommendations =
    precomputedRecommendationsBodyParams.topVideoRecommendations

  if (!userId) {
    return res.status(422).json({ message: 'Missing { userId }' })
  }

  const isValid = await validatePrecomputedRecommendations(
    precomputedRecommendationsBodyParams
  )
  if (!isValid) {
    return res.status(422).json({
      message: 'Invalid recommendations, check the { recommendation_models.ts }'
    })
  }

  const recommendations = await PrecomputedRecommendations.findOneAndUpdate(
    { userId: userId },
    {
      topTopicVideoRecommendations: topTopicVideoRecommendations,
      topVideoRecommendations: topVideoRecommendations
    },
    { upsert: true, new: true, includeResultMetadata: true }
  )

  if (!recommendations) {
    return res.status(404).json({ message: 'Update failed' })
  }

  if (recommendations.lastErrorObject.updatedExisting) {
    logger.debug(`Updated recommendations for user: ' + ${userId}`)
    return res.status(200).json({
      message: 'Updated precomputed recommendations',
      recommendations: recommendations
    })
  }

  if (recommendations.lastErrorObject.updatedExisting === false) {
    logger.debug(`Created recommendations for user: ' + ${userId}`)
    return res.status(200).json({
      message: 'Created precomputed recommendations',
      recommendations: recommendations
    })
  }

  logger.warn('Unexpected metadata object from findOneAndUpdate')
  return res.status(200).json({
    message: 'Success, but something weird happened',
    recommendations: recommendations
  })
}

export const deletePrecomputedRecommendations = async (
  req: Request<{}, {}, PrecomputedRecommendationsDocument>,
  res: Response
) => {
  const userId = req.body.userId
  if (!userId) {
    return res.status(422).json({ message: 'Missing userId' })
  }

  const recommendations = await PrecomputedRecommendations.findOneAndDelete({
    userId: userId
  })

  if (!recommendations) {
    return res
      .status(404)
      .json({ message: 'Precomputed recommendations not found' })
  }

  logger.debug(`Deleted precomputed recommendations for user: ' + ${userId}`)

  return res
    .status(200)
    .json({ message: 'Success, precomputed recommendations deleted' })
}
