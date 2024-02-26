import { Request, Response, Router } from 'express'
import { requireAdmin } from '../services/passport'
import { logger } from '../services/logger'

import * as SearchController from '../controllers/search_controllers'
const searchRouter = Router()

/**
 * GET /search/videos
 * 
 * @pathparam {string} q - the search query
 */
searchRouter.get('/search/videos', requireAdmin, async (req: Request, res: Response) => {
  const query = req.query.q.toString()
  try {
    const results = await SearchController.searchTranscript(query)
    return res.status(200).json({ results: results })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ error: error })
  }
})

/**
 * GET /search/topics
 * 
 * @pathparam {string} q - the search query
 */
searchRouter.get('/search/topics', requireAdmin, async (req: Request, res: Response) => {
  const query = req.query.q.toString()
  try {
    const results = await SearchController.searchTopics(query)
    return res.status(200).json({ results: results })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ error: error })
  }
})

export default searchRouter
