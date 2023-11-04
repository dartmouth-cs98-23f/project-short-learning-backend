import {
  PrecomputedRecommendationsDocument,
  Recommendation
} from '../../models/recommendation_models'
import { VideoMetadata, VideoMetadataDocument } from '../../models/video_models'
import { logger } from '../../services/logger'

export const validatePrecomputedRecommendations = async (
  recommendations: PrecomputedRecommendationsDocument
): Promise<boolean> => {
  // Checks that the videoIds are valid in the DB
  const checkVideos = async (recommendations: Recommendation[]) => {
    for (const recommendation of recommendations) {
      let videoMetadata: VideoMetadataDocument
      if (!recommendation.videoId) {
        logger.warn(`Invalid videoId, ${recommendation.videoId}`)
        return false
      }
      try {
        videoMetadata = await VideoMetadata.findById(recommendation.videoId)
      } catch (err) {
        logger.warn(`Invalid videoId, ${recommendation.videoId}`)
        return false
      }
      if (!videoMetadata) {
        logger.warn(`Invalid videoId, ${recommendation.videoId}`)
        return false
      }

      // If clipIndex is specified, check that it is valid
      if (recommendation.clipIndex) {
        if (recommendation.clipIndex < 0) {
          logger.warn(`Invalid clipIndex, ${recommendation.clipIndex}`)
          return false
        }
        if (recommendation.clipIndex >= videoMetadata.clips.length) {
          logger.warn(`Invalid clipIndex, ${recommendation.clipIndex}`)
          return false
        }
      }
    }
    return true
  }
  if (recommendations.topTopicVideoRecommendations) {
    const isValid = await checkVideos(
      recommendations.topTopicVideoRecommendations
    )
    if (!isValid) {
      logger.warn(
        `Invalid topTopicVideoRecommendations, ${recommendations.topTopicVideoRecommendations}`
      )
      return false
    }
  }
  if (recommendations.topVideoRecommendations) {
    const isValid = await checkVideos(recommendations.topVideoRecommendations)
    if (!isValid) {
      logger.warn(
        `Invalid topVideoRecommendations, ${recommendations.topVideoRecommendations}`
      )
      return false
    }
  }
  return true
}
