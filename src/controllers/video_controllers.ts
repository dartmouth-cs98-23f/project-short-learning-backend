import { Request, Response } from 'express'
import { VideoMetadata, InferenceSummary } from '../models/video_models'
import { ClipMetadata } from '../models/clip_models'
import { Comment } from '../models/comment_model'
import { logger } from '../services/logger'
import { topicToVideoMap } from '../technigala/map_model'

const MAX_COMMENT_LENGTH = 500

export const getVideoById = async (req: Request, res: Response) => {
  const videoId = req.params.videoId
  if (!videoId) {
    return res.status(422).json({ message: 'Missing videoId parameter' })
  }
  // populate clips field
  const metadata = await VideoMetadata.findById(videoId)
    .populate('clips')
    .exec()

  if (!metadata) {
    return res.status(404).json({ message: 'Video not found' })
  }
  logger.debug(`Found video with id ${videoId}`)
  return res.status(200).json({ message: 'Video found', metadata })
}

export const createVideo = async (req: Request, res: Response) => {
  const title = req.body.title
  const clipTitles = req.body.clipTitles || []
  const description = req.body.description
  const clipDescriptions = req.body.clipDescriptions || []
  const youtubeURL = req.body.youtubeURL
  const uploader = req.body.uploader
  const duration = req.body.duration
  const topicId = req.body.topicId
  const clipDurations = req.body.clipDurations || []
  const thumbnailURL = req.body.thumbnailURL
  const clipThumbnailURLs = req.body.clipThumbnailURLs || []
  const clipLinks: string[] = req.body.clipLinks || []

  const clipArray = [
    clipTitles,
    clipDescriptions,
    clipDurations,
    clipThumbnailURLs,
    clipLinks
  ]

  if (!title) {
    return res.status(422).json({ message: 'Missing title parameter' })
  } /* else if (!uploader) {
    return res.status(422).json({ message: 'Missing uploader parameter' })
  } */ else if (!duration) {
    return res.status(422).json({ message: 'Missing duration parameter' })
  } else if (!thumbnailURL) {
    return res.status(422).json({ message: 'Missing thumbnailURL parameter' })
  } else if (!clipLinks) {
    return res.status(422).json({ message: 'Missing clipLinks parameter' })
  } else if (
    clipArray &&
    clipArray.some(
      (clipArray) =>
        clipArray.length !== clipLinks.length &&
        clipArray.length !== clipTitles.length &&
        clipArray.length !== clipDescriptions.length &&
        clipArray.length !== clipDurations.length &&
        clipArray.length !== clipThumbnailURLs.length
    )
  ) {
    return res
      .status(422)
      .json({ message: 'Some clip array has a different length' })
  }

  // TOOD: Confirm if clips exist in S3
  // TODO: Confirm thumbnailURL exists in S3

  // Save video to database
  const videoMetadata = await VideoMetadata.create({
    title: title,
    description: description,
    youtubeURL: youtubeURL,
    uploadDate: new Date(),
    uploader: uploader,
    duration: duration,
    topicId: topicId,
    thumbnailURL: thumbnailURL,
    clips: [],
    views: [],
    likes: [],
    dislikes: []
  })
  const videoId = videoMetadata._id
  logger.debug(`Created video with id ${videoId}`)

  var clipIds: string[] = []
  // Create clips objects for each clip url

  for (var i = 0; i < clipLinks.length; i++) {
    const clip = {
      videoId: videoId,
      title: clipTitles[i],
      description: clipDescriptions[i],
      youtubeURL: youtubeURL,
      uploadDate: new Date(),
      uploader: uploader,
      duration: clipDurations[i],
      thumbnailURL: clipThumbnailURLs[i],
      clipURL: clipLinks[i],
      views: [],
      likes: [],
      dislikes: []
    }
    const clipMetadata = await ClipMetadata.create(clip)
    clipIds.push(clipMetadata._id)
    logger.debug(`Created clip with id ${clipMetadata._id}`)
  }

  // Add clip ids to video
  const videoMetadataModified = await VideoMetadata.findOneAndUpdate(
    { _id: videoId },
    { clips: clipIds },
    { new: true }
  )
  logger.debug(`Updated video with id ${videoId} to add clip IDs`)

  return res.json({
    message: 'Video created successfully',
    videoId: videoId,
    clipIds: clipIds
  })
}

export const deleteVideo = async (req: Request, res: Response) => {
  const videoId = req.params.videoId
  if (!videoId) {
    return res.status(422).json({ message: 'Missing videoId parameter' })
  }

  const videoMetadata = await VideoMetadata.findById(videoId)
  if (!videoMetadata) {
    return res.status(404).json({ message: 'Video not found' })
  }

  const clipIds = videoMetadata.clips
  clipIds.forEach(async (clipId) => {
    const clipMetadata = await ClipMetadata.findByIdAndDelete(clipId)
    if (!clipMetadata) {
      logger.error(`Clip ${clipId} not found`)
    } else {
      logger.debug(`Deleted clip ${clipId}`)
    }
  })

  const commentIds = await Comment.find({ videoId: videoId })

  commentIds.forEach(async (commentId) => {
    const comment = await Comment.findByIdAndDelete(commentId)
    if (!comment) {
      logger.error(`Comment ${commentId} not found`)
    } else {
      logger.debug(`Deleted comment ${commentId}`)
    }
  })

  await VideoMetadata.findByIdAndDelete(videoId)

  return res.json({ message: 'Video deleted successfully' })
}

export const addLike = async (req: Request, res: Response) => {
  const videoId = req.params.videoId
  const userId = req.user
  if (!videoId) {
    return res.status(422).json({ message: 'Missing videoId parameter' })
  }

  // update "likes" field and push userId to the array if it doesn't exist
  const metadata = await VideoMetadata.findOneAndUpdate(
    { _id: videoId },
    { $addToSet: { likes: userId } },
    { new: true }
  )
  if (!metadata) {
    return res.status(404).json({ message: 'Video not found' })
  }

  logger.debug(metadata.likes)
  logger.debug(metadata.likes.length)

  return {
    message: 'Like successful',
    likes: metadata.likes.length
  }
}

export const addDislike = async (req: Request, res: Response) => {
  const videoId = req.params.videoId
  const userId = req.user
  if (!videoId) {
    return res.status(422).json({ message: 'Missing videoId parameter' })
  }

  // update "dislikes" field and push userId to the array if it doesn't exist
  const metadata = await VideoMetadata.findOneAndUpdate(
    { _id: videoId },
    { $addToSet: { dislikes: userId } },
    { new: true }
  )

  if (!metadata) {
    return res.status(404).json({ message: 'Video not found' })
  }

  return {
    message: 'Dislike successful',
    dislikes: metadata.dislikes.length
  }
}

export const getComments = async (req: Request, res: Response) => {
  const videoId = req.params.videoId
  const limit = req.body.limit

  if (!videoId) {
    return res.status(422).json({ message: 'Missing videoId parameter' })
  }

  const exists = await VideoMetadata.exists({ _id: videoId })
  if (!exists) {
    return res.status(404).json({ message: 'Video not found' })
  }

  // Get total number of comments for this video
  const totalComments = await Comment.find({
    videoId: videoId
  }).countDocuments()

  // Grab the last 50 comments or last "limit" comments, make sure that isReply is false
  const comments = await Comment.find({ videoId: videoId })
    .where('isReply')
    .equals(false)
    .sort({ createdAt: -1 })
    .limit(limit ? limit : 50)
    .populate('nestedComments')
    .exec()

  logger.debug(`Found ${totalComments} ${comments} comments`)

  return res
    .status(200)
    .json({ message: 'Comments found', totalComments, comments })
}

export const addComment = async (req: Request, res: Response) => {
  const videoId = req.params.videoId
  const userId = req.user
  const text = req.body.text
  const parentCommentId = req.body.parentCommentId

  if (!videoId) {
    return res.status(422).json({ message: 'Missing videoId parameter' })
  } else if (!text) {
    return res.status(422).json({ message: 'Missing text parameter' })
  } else if (text.length > MAX_COMMENT_LENGTH) {
    return res.status(422).json({ message: 'Comment too long' })
  }

  // check if video exists
  const exists = await VideoMetadata.exists({ _id: videoId })
  if (!exists) {
    return res.status(404).json({ message: 'Video not found' })
  }

  // create new comment object
  const newComment = await Comment.create({
    userId,
    videoId,
    clipId: null,
    text,
    likes: [],
    nestedComments: [],
    isReply: !!parentCommentId
  })

  if (parentCommentId) {
    const parentComment = await Comment.findByIdAndUpdate(parentCommentId, {
      $addToSet: { nestedComments: newComment._id }
    })
    if (!parentComment) {
      await Comment.findByIdAndDelete(newComment._id)
      return res.status(404).json({ message: 'Parent comment not found' })
    }
  }

  // get amount of comments on this videoId
  const totalComments = await Comment.find({
    videoId: videoId
  }).countDocuments()

  return res.json({
    message: 'Comment successful',
    totalComments,
    _id: newComment._id
  })
}

export const deleteComment = async (req: Request, res: Response) => {
  const videoId = req.params.videoId
  const commentId = req.params.commentId

  if (!videoId) {
    return res.status(422).json({ message: 'Missing videoId parameter' })
  } else if (!commentId) {
    return res.status(422).json({ message: 'Missing commentId parameter' })
  }

  // check if video exists
  const videoMetadata = await VideoMetadata.exists({ _id: videoId })
  if (!videoMetadata) {
    return res.status(404).json({ message: 'Video not found' })
  }

  // delete comment
  const comment = await Comment.findById(commentId)
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' })
  }

  const nestedComments = comment.nestedComments
  for (var i = 0, n = nestedComments.length; i < n; i++) {
    const commentMetadata = await Comment.findByIdAndDelete(nestedComments[i])
    if (!commentMetadata) {
      logger.error(`Comment ${nestedComments[i]} not found`)
    } else {
      logger.debug(`Deleted comment ${nestedComments[i]}`)
    }
  }

  await Comment.findByIdAndDelete(commentId)

  return res.json({
    message: 'Comment deleted successfully'
  })
}

export const addLikeToComment = async (req: Request, res: Response) => {
  const videoId = req.params.videoId
  const commentId = req.params.commentId
  const userId = req.user

  if (!videoId) {
    return res.status(422).json({ message: 'Missing videoId parameter' })
  } else if (!commentId) {
    return res.status(422).json({ message: 'Missing commentId parameter' })
  }

  // check if video exists
  const exists = await VideoMetadata.exists({ _id: videoId })
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
    likes: comment.likes.length
  })
}

export const getVideoSummary = async (videoId: string) => {
  const inferenceSummary = await InferenceSummary.findOne({ _id: videoId })
  return inferenceSummary
}
