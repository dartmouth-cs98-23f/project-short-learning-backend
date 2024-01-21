import mongoose, { Document, Schema, Types } from 'mongoose';

interface WatchHistoryDocument extends Document {
  userId: Types.ObjectId;
  date: Date;
  videoId: Types.ObjectId;
}

const WatchHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    videoId: { type: Schema.Types.ObjectId, ref: 'VideoMetadata', required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
  }
);

WatchHistorySchema.index({ userId: 1, videoId: 1 }, { unique: true });
WatchHistorySchema.index({ date: 1 });

const WatchHistoryModel = mongoose.model<WatchHistoryDocument>('WatchHistory', WatchHistorySchema);

export default WatchHistoryModel;
