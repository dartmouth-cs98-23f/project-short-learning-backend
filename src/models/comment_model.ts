import mongoose, { Schema, Document } from 'mongoose'

export interface CommentDocument extends Document {
  userId: string
  videoId: string
  text: string
  likes: string[]
  parentId: string | null // Parent comment id, null if top level comment
}

const CommentSchema: Schema = new Schema(
  {
    userId: { type: String, ref: 'Users', required: true },
    videoId: { type: String, ref: 'video_metadata', required: true },
    text: { type: String, required: true },
    likes: { type: [String], required: true },
    parentId: [{ type: String, ref: 'comment' }]
  },
  { timestamps: true , collection: 'comments' }
)

// Indexes
CommentSchema.index({ videoId: 1 })
CommentSchema.index({ createdAt: -1 }) // Used for fast sorts on newest comments

export const Comment = mongoose.model<CommentDocument>('comment', CommentSchema)
