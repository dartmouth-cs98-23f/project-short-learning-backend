import { Router } from 'express'
import { requireAuth, requireSignin } from '../services/passport'
import * as Relationships from '../controllers/relationship_controllers'

const router = Router()

/**
 * Create a new relationship.
 *
 * Takes in the new userIDs.
 * Status initialized to 'pending'.
 */
router.post('/relationships', async (req, res) => {
  // get the fromUserID from the request body
  const fromUserID = req.body.fromUserID
  const toUserID = req.body.toUserID
  try {
    const relationship = await Relationships.create({ fromUserID, toUserID })
    res.json(relationship)
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

/**
 * Update an existing relationship.
 *
 */
router.put('/relationships', async (req, res) => {
  // get the fromUserID from the request body
  const fromUserID = req.body.fromUserID
  const toUserID = req.body.toUserID
  const status = req.body.status
  try {
    const relationship = await Relationships.update({
      fromUserID,
      toUserID,
      status
    })
    res.json(relationship)
  } catch (error) {
    console.log(error)
    res.status(422).send({ error: error })
  }
})

/**
 * Get all relationships for a user.
 *
 * Returns all users that have a relationship with the given user (including pending!).
 *
 * Caller should handle filtering or use one of the other endpoints
 * that promise to return a specific subset of relationships.
 */
router.get('/relationships/:userId', async (req, res) => {
  const direction = req.query.direction || 'all'
  const status: string = req.query.status?.toString() || 'all'

  let relationships

  try {
    switch (direction) {
      case 'outgoing':
        relationships = await Relationships.getOutgoing(
          req.params.userId,
          status
        )
        break
      case 'incoming':
        relationships = await Relationships.getIncoming(
          req.params.userId,
          status
        )
        break
      case 'all':
        relationships = await Relationships.getAll(req.params.userId, status)
        break
      default:
        throw new Error('Invalid direction')
    }
    res.json(relationships)
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

/**
 * Get all connections to a given user
 *
 * Only returns a list of userIDs that are in a relationship with the given user.
 */
router.get('/connections/:userId', async (req, res) => {
  // get direction from query params
  const direction = req.query.direction || 'all'

  // get status from query params
  const status: string = req.query.status?.toString() || 'all'

  try {
    const connections = await Relationships.getConnections(
      req.params.userId,
      direction,
      status
    )
    res.json(connections)
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

export default router
