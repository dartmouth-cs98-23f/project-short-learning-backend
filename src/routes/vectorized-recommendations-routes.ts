import { Request, Response, Router } from 'express'
import { requireAdmin } from '../services/passport'
import { logger } from '../services/logger'

import * as VectorizedRecControllers from '../controllers/vectorized_recommendation_controllers'
const vectorizedRecRouter = Router()

/**
 * GET /vectorized-recommendations
 * 
 * @param {string} videoId - the videoId of the video to get recommendations from
 * @param {string} userId - the userId of the user to get recommendations for
 */
vectorizedRecRouter.get('/vectorized-recommendations', requireAdmin, async (req: Request, res: Response) => {
  const videoId = req.query?.videoId?.toString() || ""
  const userId = req.query?.userId?.toString() || ""
  try {
    const results = await VectorizedRecControllers.getRecommendations(videoId, userId)
    return res.status(200).json({ results: results })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ error: error })
  }
})

export default vectorizedRecRouter
