import { Request, Router } from 'express'
import {
  GetNewRecommendationBodyParams,
  PrecomputedRecommendationsDocument
} from '../models/recommendation_models'
import { requireAdmin, requireAuth } from '../services/passport'
import {
  deletePrecomputedRecommendations,
  getNewPrecomputedVideoRecommendation,
  getPrecomputedRecommendations,
  updatePrecomputedRecommendations
} from '../controllers/recommendation_controllers'
export const recommendationRouter = Router()

/**
 * GET request to get precomputed recommendations
 * - See src/models/recommendation_models.ts for the PrecomputedRecommendations schema
 *
 * @bodyparam userId: ObjectId // the userId of the user to get recommendations for
 *
 * @returns message // a message indicating success or failure
 *          recommendations: PrecomputedRecommendationsDocument // the recommendations for the user
 *
 * @errors 404 if recommendations are not found
 *         422 if userId is missing
 *         500 if server error
 */
recommendationRouter.get(
  '/recommendations/precomputed',
  requireAuth,
  async (req: Request<{}, {}, PrecomputedRecommendationsDocument>, res) => {
    try {
      getPrecomputedRecommendations(req, res)
    } catch (error) {
      return res.status(500).json({ message: 'Server Error' })
    }
  }
)

/**
 * PUT request to create precomputed recommendations or update existing ones
 * - See src/models/recommendation_models.ts for the PrecomputedRecommendations schema
 *
 * @bodyparam userId: ObjectId // the userId of the user to get recommendations for
 * @optionalbodyparam topTopicVideoRecommendations: Recommendation // the top topic video recommendations for the user
 * @optionalbodyparam topVideoRecommendations: Recommendation // the top video recommendations for the user
 *
 * @returns message // a message indicating success or failure
 *          recommendations: PrecomputedRecommendationsDocument // the recommendations for the user
 *
 * @errors 404 if recommendations creation failed
 *         422 if parameter is missing
 *         500 if server error
 */
recommendationRouter.put(
  '/recommendations/precomputed',
  requireAdmin,
  async (req: Request<{}, {}, PrecomputedRecommendationsDocument>, res) => {
    try {
      updatePrecomputedRecommendations(req, res)
    } catch (error) {
      return res.status(500).json({ message: 'Server Error' })
    }
  }
)

/**
 * DELETE request to delete precomputed recommendations
 *
 * @bodyparam userId: ObjectId // the userId of the user to get recommendations for
 *
 * @returns message // a message indicating success or failure
 *
 * @errors 404 if recommendations are not found
 *         422 if userId is missing
 *         500 if server error
 */
recommendationRouter.delete(
  '/recommendations/precomputed',
  requireAdmin,
  async (req: Request<{}, {}, PrecomputedRecommendationsDocument>, res) => {
    try {
      deletePrecomputedRecommendations(req, res)
    } catch (error) {
      return res.status(500).json({ message: 'Server Error' })
    }
  }
)

recommendationRouter.post(
  '/newVideo',
  requireAuth,
  async (req: Request<{}, {}, GetNewRecommendationBodyParams>, res) => {
    try {
      getNewPrecomputedVideoRecommendation(req, res)
    } catch (error) {
      return res.status(500).json({ message: 'Server Error' })
    }
  }
)
