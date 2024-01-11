import mongoose, { Document, Schema } from 'mongoose';

const WatchHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    history: [
      {
        date: { type: Schema.Types.Date, required: true },
        videoId: { type: Schema.Types.ObjectId, ref: 'VideoMetadata' },
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

const WatchHistoryModel = mongoose.model('WatchHistory', WatchHistorySchema);

export default WatchHistoryModel;
