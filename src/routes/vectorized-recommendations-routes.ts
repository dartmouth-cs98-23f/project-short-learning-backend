import { Request, Response, Router } from 'express'
import { requireAdmin, requireAuth } from '../services/passport'
import { logger } from '../services/logger'

import * as VectorizedRecControllers from '../controllers/vectorized_recommendation_controllers'
const vectorizedRecRouter = Router()


// TODO: When new call, updates the user's affinity
//// Updating Global User Affinities
// When scaling the actual user affinities, we must normalize their affinities based on the new values
//   we've added in. We also have a much higher magnitude of values coming in. I think we set a goal
//   such that we change up to 40% of the user affinity. Mostly for technigala. Consider using
//   topics rather than affinities.

// 1. Looking at recommendation endpoint, if a new seedId is provided, we process the current active
//    history and update the user affinity.
// 2. Take average across the history, scale by 0.4, then add to current user affinity and perform
//    feature scaling/min-max scaling.

// 3. If seed is not provided, take the activeAffinities and use those to modify the query.
//    The amount of modification should decay based on how far back the activeAffinity was added.
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
    const results = await VectorizedRecControllers.getVideoRecommendations(videoId, user)
    return res.status(200).json({ results: results })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ error: `Video ${videoId} not found` })
  }
})

export default vectorizedRecRouter
