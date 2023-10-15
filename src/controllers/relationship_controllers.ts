import Relationship from '../models/relationship_model';
import { Types as MongoTypes } from 'mongoose';

/**
 * Create a new relationship between two users.
 * 
 * @param relationship - 
 * @returns {Object} - The **_new_** relationship object.
 */
export const create = async ( 
  { fromUserID, toUserID }: {
    fromUserID: MongoTypes.ObjectId  // ObjectId,
    toUserID: MongoTypes.ObjectId,
  }) => {
  
  const relationship = new Relationship({
    fromUserID,
    toUserID,
    status: 'pending',
    initiatedDate: Date.now(),
    updatedDate: Date.now(),
  });
  try {
    await relationship.save();
    return relationship;
  } catch (error) {
    return error;
  }
};

export const update = async ({
  fromUserID, toUserID, status
}) => {
  try {
    const relationship = await Relationship.findOneAndUpdate(
      { fromUserID, toUserID },
      { status, updatedDate: Date.now() },
      { new: true }  // return the updated document
    );
    return relationship;
  } catch (error) {
    return error;
  }
}

export const getAll = async (userID: String) => {
  try {
    const relationships = await Relationship.find({
      $or: [
        { fromUserID: userID },
        { toUserID: userID },
      ]
    });
    return relationships;
  } catch (error) {
    return error;
  }
}

export const getOutgoing = async (userID: String) => {
  try {
    const relationships = await Relationship.find({ fromUserID: userID });
    return relationships;
  } catch (error) {
    return error;
  }
}

export const getIncoming = async (userID: String) => {
  try {
    const relationships = await Relationship.find({ toUserID: userID });
    return relationships;
  } catch (error) {
    return error;
  }
}

export const getPending = async (userID: String, direction: "outgoing" | "incoming" | "all") => {
  try {
    let relationships;
    switch (direction) {
      case "outgoing":
        relationships = await Relationship.find({ fromUserID: userID, status: "pending" });
        return relationships;
      case "incoming":
        relationships = await Relationship.find({ toUserID: userID, status: "pending" });
        return relationships;
      case "all":
        relationships = await Relationship.find({
          $or: [
            { fromUserID: userID, status: "pending" },
            { toUserID: userID, status: "pending" },
          ]
        });
        return relationships;
      default:
        return [];
    }
  }
  catch (error) {
    return error;
  }
}
