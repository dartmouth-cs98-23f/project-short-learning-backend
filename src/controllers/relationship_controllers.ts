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

/**
 * Update an existing relationship between two users.
 */
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

/**
 * Get all relationships for a user.
 * 
 * Useful for getting a list of all users that a user is friends with.
 */
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

/**
 * Get outgoing relationships for a user
 * 
 * Useful for getting a list of users that a user has sent a friend request to.
 * 
 * NOTE: To get **pending** outgoing relationships, use `getPending` instead
 * and specify the relevant `direction = "outgoing"`.
 */
export const getOutgoing = async (userID: String) => {
  try {
    const relationships = await Relationship.find({ fromUserID: userID });
    return relationships;
  } catch (error) {
    return error;
  }
}

/**
 * Get incoming relationships for a user.
 * 
 * Useful for getting a list of users who initiated their relationship with a given user.
 * 
 * NOTE: To get **pending** incoming relationships, use `getPending` instead
 * and specify the relevant `direction = incoming`.
 */
export const getIncoming = async (userID: String) => {
  try {
    const relationships = await Relationship.find({ toUserID: userID });
    return relationships;
  } catch (error) {
    return error;
  }
}

/**
 * Get pending relationships for a user.
 * 
 * Useful for getting a list of users that:
 * - have sent a friend request to a user
 * - a user has sent a friend request to
 * ... but the request has not been accepted yet.
 */
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

/**
 * Get all *user IDs* for a user that match a given status.
 * 
 * @returns {Array} - An array of user IDs that match the given status
 *   in a relationship with current user ID.
 */
export const getConnections = async (userID: String, status: "pending" | "accepted" | "blocked" | "declined" | "all") => {
  try {
    let relationships;
    if (status == "all") {
      relationships = await Relationship.find({
        $and: [
          { $or: [
            { fromUserID: userID },
            { toUserID: userID },
          ]},
        ]
      });
    }
    else {
      relationships = await Relationship.find({
        $and: [
          { $or: [
            { fromUserID: userID },
            { toUserID: userID },
          ]},
          { status },
        ]
      });
    }
    
    // parse relationships to get a list of user IDs that are not current userID
    const connections = relationships.map((relationship) => {
      if (relationship.fromUserID.toString() === userID) {
        return relationship.toUserID;
      } else {
        return relationship.fromUserID;
      }
    });

    return connections
  } catch (error) {
    return error;
  }
}
