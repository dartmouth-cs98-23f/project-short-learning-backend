import { Request, Response, Router } from 'express'
import { requireAdmin } from '../services/passport'
import { logger } from '../services/logger'

import * as SearchController from '../controllers/search_controllers'
const searchRouter = Router()

/**
 * GET /search/videos
 * 
 * @bodyparam {string} q - the search query
 * @bodyparam {string} topic - the topic to search for
 * 
 * NOTE: It is okay to provide one or the other, but at least one must be provided.
 * 
 * if both are provided, the query will be used.
 */
searchRouter.get('/search', requireAdmin, async (req: Request, res: Response) => {

  const query = req.query.q?.toString()
  const topic = req.query.topic?.toString()
  const user = req.query.user?.toString()
  // const all = req.query.all?.toString()

  try {
    let results
    if (query) {
      results = await SearchController.searchTranscript(query)
    }
    else if (topic) {
      results = await SearchController.searchTopics(topic)
    }
    else if (user) {
      results = await SearchController.searchUser(user)
    }

    // if results is set, return it
    if (results) {
      return res.status(200).json({ results: results })
    }
    else {
      return res.status(400).json({ error: 'No query or topic provided' })
    }
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ error: error })
  }
})

export default searchRouter
