import { Router } from 'express'
import * as Video from '../controllers/video_controllers'
import { logger } from '../services/logger'
export const videoRouter = Router()

/**
 *
 * GET /video/:videoId
 * PUT /video
 * POST /video/:videoId/like
 * POST /video/:videoId/dislike
 * GET /video/:videoId/comments
 * POST /video/:videoId/comment
 * POST /video/:videoId/comment/:commentId/like
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
videoRouter.get('/video/:videoId', async (req, res) => {
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
 * @bodyparam title: string // the title of the video
 * @bodyparam description: string // the description of the video
 * @bodyparam uploader: string // the uploader of the video
 * @bodyparam tags: string[] // the tags of the video
 * @bodyparam duration: number // the duration of the video
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
videoRouter.put('/video', async (req, res) => {
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
 * @pathparam videoId: ObjectId // the videoId of the video to delete
 *
 * @returns message: string // a message indicating success or failure
 *
 * @errors 200 if success
 *         422 if videoId is missing
 *         404 if video is not found
 *         500 if server error
 */
videoRouter.delete('/video/:videoId', async (req, res) => {
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
 * @pathparam videoId // the videoId of the video to like
 * @bodyparam userId // the userId of the user liking the video
 *
 * @returns message // a message indicating success or failure
 *          likes // the number of likes on this video
 *
 * @errors 422 if videoId or userId is missing
 *         404 if video is not found
 *         500 if server error
 */
videoRouter.post('/video/:videoId/like', async (req, res) => {
  try {
    return await Video.addLike(req, res)
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' })
  }
})

/**
 * POST request to add a dislike to a video
 *
 * @pathparam videoId // the videoId of the video to dislike
 * @bodyparam userId // the userId of the user disliking the video
 *
 * @returns message // a message indicating success or failure
 *          dislikes // the number of dislikes on this video
 *
 * @errors 422 // if videoId or userId is missing
 *         404 // if video is not found
 *         500 // if server error
 */
videoRouter.post('/video/:videoId/dislike', async (req, res) => {
  try {
    return await Video.addDislike(req, res)
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' })
  }
})

/**
 * GET request to get all comments for a video
 * - See src/models/comment_model.ts for the comments schema
 *
 * @pathparam videoId // the videoId of the video to get comments for
 * @bodyparam userId // the userId of the user getting the comments
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
videoRouter.get('/video/:videoId/comments', async (req, res) => {
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
videoRouter.post('/video/:videoId/comment', async (req, res) => {
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
 * @pathparam videoId // the videoId of the video to delete a comment from
 * @pathparam commentId // the commentId of the comment to delete
 * 
 * @returns message // a message indicating success or failure
 * 
 * @errors 422 // if videoId or commentId is missing
 *         404 // if video or comment is not found
 *         500 // if server error
 * 
 */
videoRouter.delete('/video/:videoId/comment/:commentId', async (req, res) => {
  try {
    return await Video.deleteComment(req, res)
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' })
  }
})

/**
 * POST request to add a like to a comment
 * - See src/models/comment_model.ts for the comments schema
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
  '/video/:videoId/comment/:commentId/like',
  async (req, res) => {
    try {
      return await Video.addLikeToComment(req, res)
    } catch (error) {
      return res.status(500).json({ message: 'Server Error' })
    }
  }
)
