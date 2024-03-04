import { Request, Response, Router } from 'express'
import { requireAdmin, requireAuth } from '../services/passport'
import { logger } from '../services/logger'
import * as ExploreController from '../controllers/explore_controllers'
import { allTopics } from '../utils/topics'

const searchRouter = Router()

/**
 * GET /explore/search/videos
 *
 * @queryparam {string} q - the search query
 * @queryparam {string} topic - the topic to search for
 *
 * NOTE: It is okay to provide one or the other, but at least one must be provided.
 *
 * if both are provided, the query will be used.
 */
searchRouter.get(
  '/explore/search',
  requireAuth,
  async (req: Request, res: Response) => {
    const query = req.query.q?.toString()
    const topic = req.query.topic?.toString()
    const user = req.query.user?.toString()
    const all = req.query.all?.toString()

    try {
      let results

      if (all) {
        results = await ExploreController.searchAll({
          q: query,
          topic: topic,
          user: user
        })
      } else if (query) {
        results = await ExploreController.searchTranscript(query)
      } else if (topic) {
        results = await ExploreController.searchTopics(topic)
      } else if (user) {
        results = await ExploreController.searchUser(user)
        return res.status(200).json({ users: results })
      }

      // if results is set, return it
      if (results) {
        return res.status(200).json(results)
      } else {
        return res
          .status(400)
          .json({ error: 'No query, topic, or user regex provided' })
      }
    } catch (error) {
      logger.error(error)
      return res.status(500).json({ error: error })
    }
  }
)

/**
 * GET /explore/explorepage
 *
 * @queryparam {string} page - the page number to get
 *
 * Used for the explore page.
 */
searchRouter.get(
  '/explore/explorepage',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id
      const page = parseInt(req.query.page?.toString()) || 1

      const roles = await ExploreController.getTopRoles(userId) // This looks weird, check why QA first tomorrow?
      const role = roles[(page - 1) % roles.length]
      const roleVideos = await ExploreController.getRoleVideos(userId, role, 1)

      const topics = await ExploreController.getTopTopics(userId, page * 2)
      const topic1 = topics[topics.length - 1]
      const topic2 = topics[topics.length - 2]
      const topicName1 = allTopics[topic1]
      const topicName2 = allTopics[topic2]

      const topicVideos1 = await ExploreController.getTopicVideos(
        userId,
        topic1,
        1
      )
      const topicVideos2 = await ExploreController.getTopicVideos(
        userId,
        topic2,
        1
      )
      
      return res.status(200).json({
        topicVideos: [
          { topic: topicName1, videos: topicVideos1 },
          { topic: topicName2, videos: topicVideos2 }
        ],
        roleVideos: [{ role, videos: roleVideos }],
        page
      })
    } catch (error) {
      logger.error(error)
      return res.status(500).json({ error: error })
    }
  }
)

/**
 * GET /explore/topicpage/:topic
 *
 * @pathparam {string} topic - the topic to search for
 * @queryparam {string} page - the page number to get
 *
 * Used to get the explore page of a specific topic.
 *
 * Returns:
 *  - videos {<VideoMetadata>[]}: the videos for the topic
 *  - graphValues {number[]}: the graph values for the topic
 */
searchRouter.get(
  '/explore/topicpage/:topicId',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const topicId = req.params.topicId
      const page = parseInt(req.query.page?.toString() || '1')
      const userId = req.user.id
      const results = await ExploreController.getTopicVideos(
        userId,
        topicId,
        page
      )
      const graphValues = await ExploreController.getTopicGraphValues(topicId)
      return res.status(200).json({ videos: results, graphValues })
    } catch (error) {
      logger.error(error)
      return res.status(500).json({ error: error })
    }
  }
)

export default searchRouter
