import mongoose, { Schema } from 'mongoose';

const RelationshipSchema = new Schema({
  fromUserID: { type: Schema.Types.ObjectId, ref: 'Users' },
  toUserID: { type: Schema.Types.ObjectId, ref: 'Users' },
  status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'declined', 'blocked'] },
  initiatedDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
});

const RelationShipModel = mongoose.model('Relationships', RelationshipSchema);

export default RelationShipModel;
