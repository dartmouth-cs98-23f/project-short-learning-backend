import Relationship from '../models/relationship_model'

/**
 * Create a new relationship between two users.
 *
 * @param relationship -
 * @returns {Object} - The **_new_** relationship object.
 */
export const create = async ({
  fromUserID,
  toUserID
}: {
  fromUserID: string // ObjectId,
  toUserID: string
}) => {
  const relationship = new Relationship({
    fromUserID,
    toUserID,
    status: 'pending',
    initiatedDate: Date.now(),
    updatedDate: Date.now()
  })
  try {
    await relationship.save()
    return relationship
  } catch (error) {
    return error
  }
}

/**
 * Update an existing relationship between two users.
 */
export const update = async ({ fromUserID, toUserID, status }) => {
  try {
    if (!['pending', 'accepted', 'declined', 'blocked'].includes(status)) {
      throw new Error('Invalid status')
    }

    const relationship = await Relationship.findOneAndUpdate(
      { fromUserID, toUserID },
      { status, updatedDate: Date.now() },
      { new: true } // return the updated document
    )
    return relationship
  } catch (error) {
    return error
  }
}

/**
 * Get all relationships for a user.
 *
 * Useful for getting a list of all users that a user is friends with.
 */
export const getAll = async (userID: string, status?: string) => {
  try {
    let relationships
    if (status !== 'all') {
      relationships = await Relationship.find({
        $and: [
          { $or: [{ fromUserID: userID }, { toUserID: userID }] },
          { status }
        ]
      })
    } else {
      relationships = await Relationship.find({
        $or: [{ fromUserID: userID }, { toUserID: userID }]
      })
    }
    return relationships
  } catch (error) {
    return error
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
export const getOutgoing = async (userID: string, status: string) => {
  try {
    let relationships
    if (status !== 'all') {
      relationships = await Relationship.find({
        $and: [{ fromUserID: userID }, { status }]
      })
    } else {
      relationships = await Relationship.find({
        fromUserID: userID
      })
    }
    return relationships
  } catch (error) {
    return error
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
export const getIncoming = async (userID: string, status: string) => {
  try {
    let relationships
    if (status !== 'all') {
      relationships = await Relationship.find({
        $and: [{ toUserID: userID }, { status }]
      })
    } else {
      relationships = await Relationship.find({
        toUserID: userID
      })
    }
    return relationships
  } catch (error) {
    return error
  }
}

/**
 * Get all *user IDs* in a relationship with a given user, that match a given status.
 *
 * @returns An array of user IDs that match the given status
 *   in a relationship with current user ID.
 */
export const getConnections = async (
  userID: string,
  direction,
  status: string
): Promise<Array<String>> => {
  try {
    let relationships

    switch (direction) {
      case 'outgoing':
        relationships = await getOutgoing(userID, status)
        break

      case 'incoming':
        relationships = await getIncoming(userID, status)
        break

      case 'all':
        relationships = await getAll(userID, status)
        break

      default:
        throw new Error('Invalid direction')
    }
    // parse relationships to get a list of user IDs that are not current userID
    const connections = new Set<string>(
      relationships.map((relationship) => {
        if (relationship.fromUserID === userID) {
          return relationship.toUserID
        } else {
          return relationship.fromUserID
        }
      })
    )

    return Array.from(connections)
  } catch (error) {
    return error
  }
}
