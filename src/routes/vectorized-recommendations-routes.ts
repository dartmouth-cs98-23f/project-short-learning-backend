import { Request, Response, Router } from 'express'
import { requireAdmin, requireAuth } from '../services/passport'
import { logger } from '../services/logger'

import * as VectorizedRecControllers from '../controllers/vectorized_recommendation_controllers'
const vectorizedRecRouter = Router()

/**
 * GET /recommendations/vectorized
 * 
 * @bodyparam {string} videoId - the videoId of the video to get recommendations from
 * @bodyparam {string} userId - the userId of the user to get recommendations for
 */
vectorizedRecRouter.get('/recommendations/vectorized', requireAuth, async (req: Request, res: Response) => {
  const videoId = req.query?.videoId?.toString() || ""
  const user = req.user.id
  try {
    logger.debug(`Getting vectorized recommendations for video ${videoId}, ${user}`)
    const results = await VectorizedRecControllers.getVideoRecommendations(videoId, user)
    return res.status(200).json({ results: results })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ error: `Video ${videoId} not found` })
  }
})

export default vectorizedRecRouter
