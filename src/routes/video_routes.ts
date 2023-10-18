import { Router } from 'express'
import { VideoMetadata } from '../models/video_models'
import { Comment } from '../models/comment_model'
import { logger } from '../services/logger'

export const videoRouter = Router()

const MAX_COMMENT_LENGTH = 500

/**
 * GET request to get video metadata
 *  - See src/models/video_models.ts for the VideoMetadata schema
 *
 * @pathparam videoId the videoId of the video to get metadata for
 *
 * @returns a json object with the message and the metadata
 *
 * @errors 422 if videoId is missing
 *         404 if video is not found
 *         500 if server error
 */
videoRouter.get('/video/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId
    if (!videoId) {
      return res.status(422).json({ message: 'Missing videoId parameter' })
    }

    const metadata = await VideoMetadata.findOne({ videoId })
    if (!metadata) {
      return res.status(404).json({ message: 'Video not found' })
    }

    return res.status(200).json({ message: 'Video found', metadata })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

/**
 * POST request to add a like to a video
 *
 * @pathparam videoId the videoId of the video to like
 * @bodyparam userId the userId of the user liking the video
 *
 * @returns a json object with the message and the number of likes
 *
 * @errors 422 if videoId or userId is missing
 *         404 if video is not found
 *         500 if server error
 */
videoRouter.post('/video/:videoId/like', async (req, res) => {
  try {
    const videoId = req.params.videoId
    const userId = req.body.userId
    console.log(videoId, userId)
    if (!videoId) {
      return res.status(422).json({ message: 'Missing videoId parameter' })
    } else if (!userId) {
      return res.status(422).json({ message: 'Missing userId parameter' })
    }

    // update "likes" field and push userId to the array if it doesn't exist
    const metadata = await VideoMetadata.findOneAndUpdate(
      { videoId },
      { $addToSet: { likes: userId } },
      { new: true }
    )
    if (!metadata) {
      return res.status(404).json({ message: 'Video not found' })
    }

    return res.json({
      message: 'Like successful',
      likes: metadata.likes.length
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

/**
 * POST request to add a dislike to a video
 *
 * @pathparam videoId the videoId of the video to dislike
 * @bodyparam userId the userId of the user disliking the video
 *
 * @returns a json object with the message and the number of dislikes
 *
 * @errors 422 if videoId or userId is missing
 *         404 if video is not found
 *         500 if server error
 */
videoRouter.post('/video/:videoId/dislike', async (req, res) => {
  try {
    const videoId = req.params.videoId
    const userId = req.body.userId
    if (!videoId) {
      return res.status(422).json({ message: 'Missing videoId parameter' })
    } else if (!userId) {
      return res.status(422).json({ message: 'Missing userId parameter' })
    }

    // update "dislikes" field and push userId to the array if it doesn't exist
    const metadata = await VideoMetadata.findOneAndUpdate(
      { videoId },
      { $addToSet: { dislikes: userId } },
      { new: true }
    )

    if (!metadata) {
      return res.status(404).json({ message: 'Video not found' })
    }

    return res.json({
      message: 'Dislike successful',
      likes: metadata.dislikes.length
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
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
 *          totalComments // the number of comments on this video
 *          comments // an array of comments
 *
 * @errors 422 if videoId is missing
 *         404 if video is not found
 *         500 if server error
 */
videoRouter.get('/video/:videoId/comments', async (req, res) => {
  try {
    const videoId = req.params.videoId
    const userId = req.body.userId
    const limit = req.body.limit

    if (!videoId) {
      return res.status(422).json({ message: 'Missing videoId parameter' })
    } else if (!userId) {
      return res.status(422).json({ message: 'Missing userId parameter' })
    }

    const exists = await VideoMetadata.exists({ videoId })
    if (!exists) {
      return res.status(404).json({ message: 'Video not found' })
    }

    // Get total number of comments for this video from collection metadata
    const totalComments = await Comment.estimatedDocumentCount({ videoId })

    // Grab the last 50 comments or last "limit" comments
    const comments = await Comment.find({ videoId })
      .sort({ createdAt: -1 })
      .limit(limit ? limit : 50)
      .exec()

    return res
      .status(200)
      .json({ message: 'Comments found', totalComments, comments })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
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
 *          totalComments // the number of comments on this video
 *
 * @errors 422 // if videoId, userId, or text is missing
 *         404 // if video is not found
 *         500 // if server error
 */
videoRouter.post('/video/:videoId/comment', async (req, res) => {
  try {
    const videoId = req.params.videoId
    const userId = req.body.userId
    const text = req.body.text
    const parentCommentId = req.body.parentCommentId

    if (!videoId) {
      return res.status(422).json({ message: 'Missing videoId parameter' })
    } else if (!userId) {
      return res.status(422).json({ message: 'Missing userId parameter' })
    } else if (!text) {
      return res.status(422).json({ message: 'Missing comment parameter' })
    } else if (text.length > MAX_COMMENT_LENGTH) {
      return res.status(422).json({ message: 'Comment too long' })
    }

    // check if video exists
    const exists = await VideoMetadata.exists({ videoId })
    if (!exists) {
      return res.status(404).json({ message: 'Video not found' })
    }

    // create new comment object
    const newComment = new Comment({
      userId,
      videoId,
      text,
      likes: [],
      parentId: parentCommentId ? parentCommentId : null
    })
    await newComment.save()

    // get amount of comments on this videoId
    const totalComments = await Comment.estimatedDocumentCount({ videoId })

    return res.json({
      message: 'Comment successful',
      totalComments
    })
  } catch (error) {
    logger.error(error)
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
      const videoId = req.params.videoId
      const commentId = req.params.commentId
      const userId = req.body.userId

      if (!videoId) {
        return res.status(422).json({ message: 'Missing videoId parameter' })
      } else if (!commentId) {
        return res.status(422).json({ message: 'Missing commentId parameter' })
      } else if (!userId) {
        return res.status(422).json({ message: 'Missing userId parameter' })
      }

      // check if video exists
      const exists = await VideoMetadata.exists({ videoId })
      if (!exists) {
        return res.status(404).json({ message: 'Video not found' })
      }

      // update "likes" field and push userId to the array if it doesn't exist
      const comment = await Comment.findOneAndUpdate(
        { _id: commentId },
        { $addToSet: { likes: userId } },
        { new: true }
      )
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' })
      }

      return res.json({
        message: 'Like successful',
        totalLikes: comment.likes.length
      })
    } catch (error) {
      logger.error(error)
      return res.status(500).json({ message: 'Server Error' })
    }
  }
)
