import mongoose, { Schema, Document } from 'mongoose'
import { arrayHasNoDuplicates } from './utils/validators'

/**
 * Comment Model
 * -------------
 *
 * - Comments can be tied to either a video, or a clip and a video.
 * - If a comment is tied to a video, the clipId field will be null.
 *
 */
export interface CommentDocument extends Document {
  userId: mongoose.Types.ObjectId
  videoId: mongoose.Types.ObjectId
  clipId: mongoose.Types.ObjectId | null
  text: string
  likes: mongoose.Types.ObjectId[]
  nestedComments: mongoose.Types.ObjectId[]
  isReply: boolean
}

const CommentSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'VideoMetadata',
      required: true
    },
    clipId: {
      type: Schema.Types.ObjectId,
      ref: 'ClipMetadata',
      required: false
    },
    text: { type: String, required: true },
    likes: { type: [Schema.Types.ObjectId], required: true },
    nestedComments: {
      type: [Schema.Types.ObjectId],
      ref: 'Comment',
      validate: [arrayHasNoDuplicates, 'Duplicate values not allowed.']
    },
    isReply: { type: Boolean, required: true }
  },
  { timestamps: true, collection: 'comments' }
)

CommentSchema.index({ videoId: 1 })
CommentSchema.index({ clipId: 1 })
CommentSchema.index({ createdAt: -1 }) // Used for fast sorts on newest comments

export const Comment = mongoose.model<CommentDocument>('Comment', CommentSchema)
