import mongoose, { Document, Schema, Types } from 'mongoose';

interface WatchHistoryDocument extends Document {
  userId: Types.ObjectId;
  history: {
    date: Date;
    videoId?: Types.ObjectId;
  }[];
}

const WatchHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    history: [
      {
        date: { type: Schema.Types.Date },
        videoId: { type: Schema.Types.ObjectId, ref: 'VideoMetadata', required: true },
      },
    ],
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
  }
);

WatchHistorySchema.index({ 'history.date': 1 });
WatchHistorySchema.index({ 'history.videoId': 1 }); 

const WatchHistoryModel = mongoose.model<WatchHistoryDocument>('WatchHistory', WatchHistorySchema);

export default WatchHistoryModel;
