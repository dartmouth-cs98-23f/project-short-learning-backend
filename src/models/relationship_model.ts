import mongoose, { Schema } from 'mongoose'

const RelationshipSchema = new Schema(
  {
    fromUserID: { type: String, ref: 'Users' },
    toUserID: { type: String, ref: 'Users' },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'accepted', 'declined', 'blocked']
    },
    initiatedDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now }
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
  }
)

const RelationShipModel = mongoose.model('Relationships', RelationshipSchema)

export default RelationShipModel
