import { Request, Response, Router } from 'express'
import {
  GetPlaylistQueryParams,
  GetPrecomputedQueryParams,
  PrecomputedRecommendationsDocument,
  UpdatePrecomputedBodyParams
} from '../models/recommendation_models'
import { requireAdmin, requireAuth } from '../services/passport'
import {
  deletePrecomputedRecommendations,
  getPlaylistRecommendation,
  getPrecomputedRecommendationDocument,
  getTopicsRecommendation,
  updatePrecomputedRecommendation
} from '../controllers/recommendation_controllers'
import { getTopTopics } from '../controllers/explore_controllers'
const recommendationRouter = Router()

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
  async (req: Request<{}, {}, {}, GetPrecomputedQueryParams>, res: Response) => {
    try {
      getPrecomputedRecommendationDocument(req, res)
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
  async (req: Request<{}, {}, UpdatePrecomputedBodyParams>, res) => {
    try {
      updatePrecomputedRecommendation(req, res)
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

/**
 * GET request to get a playlist(s) for a topic
 * 
 * @optionalqueryparam combinedTopicName: string // the combined topic name to get a playlist for
 * @optionalqueryparam topicId: number // the number of playlists to get
 * @optionalqueryparam numPlaylists: number // the number of playlists to get
 */

recommendationRouter.get(
  '/recommendations/playlist',
  requireAuth,
  async (req: Request<{}, {}, {}, GetPlaylistQueryParams>, res: Response) => {
    try {
      getPlaylistRecommendation(req, res)
    } catch (error) {
      return res.status(500).json({ message: 'Server Error' })
    }
  }
)

/**
 * GET request to get a list of topic recommendations
 * 
  * @optionalqueryparam limit: number // the number of topics to get
 */

recommendationRouter.get(
  '/recommendations/topics',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id
      const limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10
      const topics = await getTopTopics(userId, limit)
      return res.status(200).json({ topics })
    } catch (error) {
      return res.status(500).json({ message: 'Server Error' })
    }
  }
)

export default recommendationRouter
