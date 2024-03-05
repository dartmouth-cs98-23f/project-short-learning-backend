import { Router } from 'express'
import * as Video from '../controllers/video_controllers'
import * as VideoAffinity from '../controllers/video_affinity_controller'
import { logger } from '../services/logger'
import { requireAdmin, requireAuth } from '../services/passport'
import UserAffinityModel from '../models/user_affinity_model'
import { updateAffinityOnDislike, updateAffinityOnLike, updateAffinityOnTooEasy, updateAffinityOnTooHard } from '../controllers/user_affinity_controller'
const videoRouter = Router()

/**
 *
 * GET /videos/:videoId
 * PUT /video
 * POST /videos/:videoId/like
 * POST /videos/:videoId/dislike
 * GET /videos/:videoId/comments
 * POST /videos/:videoId/comment
 * POST /videos/:videoId/comment/:commentId/like
 */

/**
 * GET request to get video metadata
 *  - See src/models/video_models.ts for the VideoMetadata schema
 *
 * @pathparam videoId the videoId of the video to get metadata for
 *
 * @returns a json object with the message and the metadata
 *
 * @errors 200 if success
 *         422 if videoId is missing
 *         404 if video is not found
 *         500 if server error
 */
videoRouter.get('/videos/:videoId', requireAuth, async (req, res) => {
  try {
    return await Video.getVideoById(req, res)
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' })
  }
})

/**
 * PUT request to create a new video, used by internal services and is not for user uploads
 * - See src/models/video_models.ts for the VideoMetadata schema
 * - See src/models/clip_models.ts for the ClipMetadata schema
 *
 * @headers Authorization // Admin JWT token
 *
 * @bodyparam title: string // the title of the video
 * @bodyparam description: string // the description of the video
 * @bodyparam uploader: string // the uploader of the video
 * @bodyparam tags: string[] // the tags of the video
 * @bodyparam duration: number // the duration of the video
 * @bodyparam topicId: number[] // topic ID number
 * @bodyparam thumbnailURL: string // the thumbnailURL of the video
 * @bodyparam clipTitles: string[] // the titles of the clips
 * @bodyparam clipTags: string[]string[] // the tags of the clips
 * @bodyparam clipDurations: number[] // the durations of the clips
 * @bodyparam clipThumbnailURLs: string[] // the thumbnailURLs of the clips
 * @bodyparam clipLinks: string[] // the links of the clips to the Manifest
 * @bodyparam clipDescriptions: string[] // the descriptions of the clips
 *
 * @returns a json object with a success message
 *
 * @errors 200 if success
 *         422 if any data is missing
 *         500 if server error
 */
videoRouter.put('/videos', requireAdmin, async (req, res) => {
  try {
    return await Video.createVideo(req, res)
  } catch (error) {
    logger.error(error.message)
    return res.status(500).json({ message: 'Server Error' })
  }
})

/**
 * DELETE request to delete a video
 *
 * @headers Authorization // Admin JWT token
 *
 * @pathparam videoId: ObjectId // the videoId of the video to delete
 *
 * @returns message: string // a message indicating success or failure
 *
 * @errors 200 if success
 *         422 if videoId is missing
 *         404 if video is not found
 *         500 if server error
 */
videoRouter.delete('/videos/:videoId', requireAdmin, async (req, res) => {
  try {
    return await Video.deleteVideo(req, res)
  } catch (error) {
    logger.error(error.message)
    return res.status(500).json({ message: 'Server Error' })
  }
})

/**
 * POST request to add a like to a video
 *
 * @headers Authorization // the JWT token of the user liking the video
 *
 * @pathparam videoId // the videoId of the video to like
 *
 * @returns message // a message indicating success or failure
 *          likes // the number of likes on this video
 *
 * @errors 422 if videoId or userId is missing
 *         404 if video is not found
 *         500 if server error
 */
videoRouter.post('/videos/:videoId/like', requireAuth, async (req, res) => {
  try {
    const videoId = req.params.videoId
    const userId = req.user.id
    if (!videoId) {
      return res.status(422).json({ message: 'Missing videoId parameter' })
    }
    const userAffinity = await updateAffinityOnLike(
      req.user.id,
      req.params.videoId
    )
    const addLike = await Video.addLike(req, res)
    return res.json({ addLike, userAffinity })
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' })
  }
})

videoRouter.post('/videos/:videoId/toohard', requireAuth, async (req, res) => {
  try {
    const videoId = req.params.videoId
    const userId = req.user.id
    if (!videoId) {
      return res.status(422).json({ message: 'Missing videoId parameter' })
    }
    const userAffinity = await updateAffinityOnTooHard(
      req.user.id,
      req.params.videoId
    )
    return res.json({ userAffinity })
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' })
  }
})

videoRouter.post('/videos/:videoId/tooeasy', requireAuth, async (req, res) => {
  try {
    const videoId = req.params.videoId
    const userId = req.user.id
    if (!videoId) {
      return res.status(422).json({ message: 'Missing videoId parameter' })
    }
    const userAffinity = await updateAffinityOnTooEasy(
      req.user.id,
      req.params.videoId
    )
    return res.json({ userAffinity })
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' })
  }
})

/**
 * POST request to add a dislike to a video
 *
 * @headers Authorization // the JWT token of the user disliking the video
 *
 * @pathparam videoId // the videoId of the video to dislike
 *
 * @returns message // a message indicating success or failure
 *          dislikes // the number of dislikes on this video
 *
 * @errors 422 // if videoId or userId is missing
 *         404 // if video is not found
 *         500 // if server error
 */
videoRouter.post('/videos/:videoId/dislike', requireAuth, async (req, res) => {
  try {
    const videoId = req.params.videoId
    if (!videoId) {
      return res.status(422).json({ message: 'Missing videoId parameter' })
    }
    const userAffinity = await updateAffinityOnDislike(
      req.user.id,
      req.params.videoId
    )
    const addDislike = await Video.addDislike(req, res)
    return res.json({ addDislike, userAffinity })
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' })
  }
})

/**
 * GET request to get all comments for a video
 * - See src/models/comment_model.ts for the comments schema
 *
 * @headers Authorization // the JWT token of the user getting the comments
 *
 * @pathparam videoId // the videoId of the video to get comments for
 * @bodyparam limit // the number of comments to get (default 50)
 *
 * @returns message // a message indicating success or failure
 *          totalComments // the number of comments on this video (including nested)
 *          comments // an array of comments, excluding nested comments (only top level comments)
 *
 * @errors 422 // if videoId is missing
 *         404 // if video is not found
 *         500 // if server error
 */
videoRouter.get('/videos/:videoId/comments', requireAuth, async (req, res) => {
  try {
    return await Video.getComments(req, res)
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' })
  }
})

/**
 * POST request to add a comment to a video
 * - See src/models/comment_model.ts for the comments schema
 *
 * @headers Authorization // the JWT token of the user adding the comment
 *
 * @pathparam videoId // the videoId of the video to add a comment to
 * @bodyparam userId // the userId of the user adding the comment
 * @bodyparam text // the comment text to add
 * @bodyparam parentCommentId // the commentId of the parent comment if this is a reply
 *
 * @returns message // a message indicating success or failure
 *          totalComments // the number of comments on this video (including nested)
 *
 * @errors 422 // if videoId, userId, or text is missing
 *         404 // if video is not found
 *         500 // if server error
 */
videoRouter.post('/videos/:videoId/comment', requireAuth, async (req, res) => {
  try {
    return await Video.addComment(req, res)
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' })
  }
})

/**
 * DELETE request to delete a comment from a video, including all nested comments
 * - See src/models/comment_model.ts for the comments schema
 *
 * @headers Authorization // Admin JWT token
 *
 * @pathparam videoId // the videoId of the video to delete a comment from
 * @pathparam commentId // the commentId of the comment to delete
 *
 * @returns message // a message indicating success or failure
 *
 * @errors 422 /s videoId or commentId is missing
 *         404 // if video or comment is not found
 *         500 // if server error
 *
 */
videoRouter.delete(
  '/videos/:videoId/comment/:commentId',
  requireAdmin,
  async (req, res) => {
    try {
      return await Video.deleteComment(req, res)
    } catch (error) {
      return res.status(500).json({ message: 'Server Error' })
    }
  }
)

/**
 * POST request to add a like to a comment
 * - See src/models/comment_model.ts for the comments schema
 *
 * @headers Authorization // the JWT token of the user liking the comment
 *
 * @pathparam videoId // the videoId of the video to add a comment to
 * @pathparam commentId // the commentId of the comment to like
 * @bodyparam userId // the userId of the user liking the comment
 *
 * @returns message // a message indicating success or failure
 *          totalLikes // the number of likes on this comment
 *
 * @errors 422 // if videoId, commentId, or userId is missing
 *         404 // if video is not found
 *         500 // if server error
 */
videoRouter.post(
  '/videos/:videoId/comment/:commentId/like',
  requireAuth,
  async (req, res) => {
    try {
      return await Video.addLikeToComment(req, res)
    } catch (error) {
      return res.status(422).json({ message: error.toString() })
    }
  }
)

/**
 * GET request to get video affinities
 * - See src/models/video_affinity_model.ts for the VideoAffinity schema
 *
 * @pathparam videoId // the videoId of the video to get affinity for
 *
 * @returns videoAffinity // the video affinity of the video
 *
 * @errors 422 // if videoId is missing
 *         404 // if video is not found
 *         500 // if server error
 */
videoRouter.get('/videos/:videoId/affinities', async (req, res) => {
  try {
    const videoAffinity = await VideoAffinity.getVideoAffinities(
      req.params.videoId
    )
    return res.json(videoAffinity)
  } catch (error) {
    return res.status(422).json({ message: error.toString() })
  }
})

/**
 * POST request to create video affinities
 * - See src/models/video_affinity_model.ts for the VideoAffinity schema
 *
 * @pathparam videoId // the videoId of the video to update affinity for
 * @bodyparam affinities // the affinities to update
 *
 * @returns videoAffinity // the updated video affinity of the video
 *
 * @errors 422 // if videoId or affinities is missing
 *         404 // if video is not found
 *         500 // if server error
 */
videoRouter.post('/videos/:videoId/affinities', async (req, res) => {
  try {
    const videoAffinity = await VideoAffinity.createVideoAffinity(
      req.params.videoId,
      req.body
    )
    return res.json(videoAffinity)
  } catch (error) {
    return res.status(422).json({ message: error.toString() })
  }
})

/**
 * PUT request to update video affinities
 * - See src/models/video_affinity_model.ts for the VideoAffinity schema
 *
 * @pathparam videoId // the videoId of the video to update affinity for
 * @bodyparam affinities // the affinities to update
 *
 * @returns videoAffinity // the updated video affinity of the video
 *
 * @errors 422 // if videoId or affinities is missing
 *         404 // if video is not found
 *         500 // if server error
 */

videoRouter.put('/videos/:videoId/affinities', async (req, res) => {
  try {
    const videoAffinity = await VideoAffinity.updateVideoAffinities(
      req.params.videoId,
      req.body
    )
    return res.json(videoAffinity)
  } catch (error) {
    return res.status(422).json({ message: error.toString() })
  }
})

/**
 * DELETE request to delete video affinities
 * - See src/models/video_affinity_model.ts for the VideoAffinity schema
 *
 * @pathparam videoId // the videoId of the video to delete a comment from
 *
 * @returns message // a message indicating success or failure
 *
 * @errors 422 // if videoId or commentId is missing
 *         404 // if video or comment is not found
 *         500 // if server error
 *
 */
videoRouter.delete('/videos/:videoId/affinities', async (req, res) => {
  try {
    const success = await VideoAffinity.deleteVideoAffinities(
      req.params.videoId
    )
    return res.json({ success })
  } catch (error) {
    return res.status(422).json({ message: error.toString() })
  }
})

/**
 * GET request to get video summary
 * - See src/models/video_models.ts for the VideoMetadata schema
 *
 * @pathparam videoId // the videoId of the video to get summary for
 *
 */
videoRouter.get('/videos/:videoId/summary', requireAuth, async (req, res) => {
  try {
    if (!req.params.videoId) {
      return res.status(422).json({ message: 'videoId is missing' })
    }
    const summary = await Video.getVideoSummary(req.params.videoId)
    return res.json({ summary })
  } catch (error) {
    return res.status(422).json({ message: error.toString() })
  }
})

export default videoRouter
