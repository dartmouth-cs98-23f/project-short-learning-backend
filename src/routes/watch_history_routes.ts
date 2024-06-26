import { Router } from 'express'
import * as WatchHistory from '../controllers/watch_history_controller'
import { requireAuth, requireAdmin } from '../services/passport'
import { stat } from 'fs'
import { ClipMetadata } from '../models/clip_models'
import { VideoMetadata } from '../models/video_models'
import { logger } from '../services/logger'

const watchHistoryRouter = Router()

/**
 * GET request to get full video watch request
 *  - See src/models/watch_history_models.ts for the schema
 *
 * @pathparam none
 *
 * @queryparam date.gt - get watch history with date greater than this date
 * @queryparam date.lt - get watch history with date less than this date
 * @queryparam limit - limit the number of watch history returned
 *
 * @returns a list of json objects with the watch history of all videos
 *
 * @errors 200 if success
 *         422 if no watch history found
 *         500 if server error
 */
watchHistoryRouter.get('/watchhistory', requireAuth, async (req, res) => {
  try {
    const watchHistory = await WatchHistory.getWatchHistories(
      req.user,
      req.query
    )
    res.status(200).json(watchHistory)
  } catch (error) {
    res.status(422).json({ error: error.message })
  }
})

/**
 * GET request to get specific video watch request
 *  - See src/models/watch_history_models.ts for the schema
 *
 * @pathparam videoId
 *
 * @returns a json object with the watch history of the video, date object is null if none exists
 *
 * @errors 200 if success
 *         422 if no watch history found
 *         500 if server error
 */

watchHistoryRouter.get(
  '/watchhistory/:videoId',
  requireAuth,
  async (req, res) => {
    try {
      const watchHistory = await WatchHistory.getWatchHistory(
        req.user,
        req.params
      )
      res.status(200).json(watchHistory)
    } catch (error) {
      res.status(422).json({ error: error.message })
    }
  }
)

/**
 * POST request to create a new watch history
 *  - See src/models/watch_history_models.ts for the schema
 *
 * @pathparam none
 *
 * @bodyparam clipId - the clip id of the latest clip watched in this video sequence
 * @bodyparam duration - the duration of the watch history in seconds
 *
 * @returns a json object with the new watch history
 *
 * @errors 200 if success
 *         422 if no watch history found
 *         500 if server error
 */

watchHistoryRouter.post(
  '/watchhistory/:videoId',
  requireAuth,
  async (req, res) => {
    try {
      const clipId = req.body.clipId
      const duration = parseInt(req.body.duration)
      const videoId = req.params.videoId
      if (!req.body.clipId || !req.body.duration) {
        throw new Error('Clip ID and duration are required')
      }
      if (isNaN(duration)) {
        throw new Error('Duration must be a number')
      }
      if (!ClipMetadata.findById(clipId)) {
        throw new Error('Clip ID not found')
      }
      if (!VideoMetadata.findById(videoId)) {
        throw new Error('Video ID not found')
      }
      const watchHistory = await WatchHistory.insertWatchHistory(
        req.user,
        req.params,
        req.body
      )
      const affinityUpdate = await WatchHistory.updateAffinity(
        req.user.id,
        videoId,
        clipId,
        duration
      )
      res.status(200).json({ watchHistory, affinityUpdate })
    } catch (error) {
      res.status(422).json({ error: error.message })
    }
  }
)

watchHistoryRouter.post(
  '/testmany',
  requireAuth,
  async (req, res) => {
    try {
      const clipIds: string[] = req.body.clipIds
      const durations: number[] = req.body.durations.map((duration: string) => parseInt(duration))
      const videoIds = req.body.videoIds
      const watchHistories = []
      const affinityUpdates = []
      for (var i = 0; i < clipIds.length; i++) {
        if (!clipIds[i] || !durations[i]) {
          logger.error('Clip ID and duration are asdf')
          throw new Error('Clip ID and duration are required')
        }
        if (isNaN(durations[i])) {
          throw new Error('Duration must be a number')
        }
        if (!ClipMetadata.findById(clipIds[i])) {
          throw new Error('Clip ID not found')
        }
        if (!VideoMetadata.findById(videoIds[i])) {
          throw new Error('Video ID not found')
        }
        const watchHistory = await WatchHistory.insertWatchHistory(
          req.user,
          { videoId: videoIds[i] },
          { clipId: clipIds[i], duration: durations[i] }
        )
        const affinityUpdate = await WatchHistory.updateAffinity(
          req.user.id,
          videoIds[i],
          clipIds[i],
          durations[i]
        )
        watchHistories.push(watchHistory)
        affinityUpdates.push(affinityUpdate)
      }
      res.status(200).json({ history: watchHistories[0], affinity: affinityUpdates[0] })
    } catch (error) {
      res.status(422).json({ error: error.message })
    }
  }
)


/**
 * DELETE request to delete a watch history
 * - See src/models/watch_history_models.ts for the schema
 *
 * @pathparam videoId
 *
 * @returns success
 *
 * @errors 200 if success
 *         422 if no watch history found
 *         500 if server error
 **/

watchHistoryRouter.delete(
  '/watchhistory/:videoId',
  requireAuth,
  async (req, res) => {
    try {
      const watchHistory = await WatchHistory.removeWatchHistory(
        req.user,
        req.params
      )
      res.status(200).json(watchHistory)
    } catch (error) {
      res.status(422).json({ error: error.message })
    }
  }
)

/**
 * DELETE request to delete all watch histories
 * - See src/models/watch_history_models.ts for the schema
 *
 * @pathparam none
 *
 * @returns success
 *
 * @errors 200 if success
 *         422 if no watch history found
 *         500 if server error
 */

watchHistoryRouter.delete('/watchhistory', requireAuth, async (req, res) => {
  try {
    const watchHistory = await WatchHistory.removeAllWatchHistory(req.user)
    res.status(200).json(watchHistory)
  } catch (error) {
    res.status(422).json({ error: error.message })
  }
})

/**
 * GET request to get full video watch history of any usser by admin
 *  - See src/models/watch_history_models.ts for the schema
 *
 * @pathparam none
 *
 * @bodyparam userId - the user id to get the watch history for
 *
 * @queryparam date.gt - get watch history with date greater than this date
 * @queryparam date.lt - get watch history with date less than this date
 * @queryparam limit - limit the number of watch history returned
 *
 * @returns a list of json objects with the watch history of all videos
 *
 * @errors 200 if success
 *         422 if no watch history found
 *         500 if server error
 */
watchHistoryRouter.get(
  '/watchhistory/admin',
  requireAdmin,
  async (req, res) => {
    try {
      const watchHistory = await WatchHistory.adminGetWatchHistories(
        req.body,
        req.query
      )
      res.status(200).json(watchHistory)
    } catch (error) {
      res.status(422).json({ error: error.message })
    }
  }
)

/**
 * GET Request to get statistics
 *  - see src/models/watch_history_models.ts for the schema
 *
 * @bodyparam user to get the statistics for
 *
 * @returns a list of json objects with the statistics for the user
 *
 * @errors 200 if success
 *         422 if no user
 *         500 if server error
 */
watchHistoryRouter.get('/statistics', requireAuth, async (req, res) => {
  try {
    const statistics = await WatchHistory.getStatistics(req.user)
    res.status(200).json(statistics)
  } catch (error) {
    throw new Error(error)
  }
})

/**
 * GET Request to get recent topics viewed
 *  - see src/models/watch_history_models.ts for the schema
 *
 * @bodyparam user to get the recent topics for
 *
 * @returns a list of json objects with the recent topics for the user
 *
 * @errors 200 if success
 *         422 if no watch history
 *         500 if server error
 */
watchHistoryRouter.get('/recentTopics', requireAuth, async (req, res) => {
  try {
    const topics = await WatchHistory.getRecentTopics(req.user)
    res.status(200).json(topics)
  } catch (error) {
    throw new Error(error)
  }
})

export default watchHistoryRouter
