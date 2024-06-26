import { Router } from 'express'
import { requireAuth, requireAdmin } from '../services/passport'
import * as UserAffinity from '../controllers/user_affinity_controller'

const router = Router()

/**
 *
 * GET /user/affinities
 * POST /user/affinities
 * PUT /user/affinities
 * DELETE /user/affinities
 */

/**
 * POST request to create user affinities
 * - See src/models/user_affinity_model.ts for the UserAffinity schema
 *
 * @headerparam Authorization is the user's token
 * @bodyparam affinities // the list of affinities to update
 *        {
 *           topic: the affinity value
 *        }
 *       complexities // the list of complexities to update
 *        {
 *           topic: the complexity value
 *        }
 *
 * @returns a json object with user Id, affinities and complexities
 *
 * @errors
 *         401 // if unauthorized
 *         422 // if affinities is invalid
 *         500 // if server error
 */
router.post('/user/affinities', requireAuth, async (req, res) => {
  try {
    const affinity = await UserAffinity.createUserAffinities(req.user, req.body)
    res.json(affinity)
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

/**
 * GET request to get user affinities
 * - See src/models/user_affinity_model.ts for the UserAffinity schema
 *
 * @headerparam Authorization is the user's token
 *
 * @returns a json object with user Id, affinities and complexities
 *
 * @errors
 *         401 // if unauthorized
 *         422 // if affinities is invalid
 *         500 // if server error
 */
router.get('/user/affinities', requireAuth, async (req, res) => {
  try {
    const affinities = await UserAffinity.getUserAffinities(req.user)
    res.json(affinities)
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

/**
 * PUT request to update user affinities
 * - See src/models/user_affinity_model.ts for the UserAffinity schema
 *
 * @headerparam Authorization is the user's token
 *
 * @bodyparam affinities // the list of affinities to update
 *        {
 *           topic: the affinity value
 *        }
 *       complexities // the list of complexities to update
 *        {
 *           topic: the complexity value
 *        }
 *
 * @returns a json object with user Id, affinities and complexities
 *
 * @errors
 *         401 // if unauthorized
 *         422 // if affinities is invalid
 *         500 // if server error
 */
router.put('/user/affinities/', requireAuth, async (req, res) => {
  try {
    const affinity = await UserAffinity.updateUserAffinities(req.user, req.body)
    res.json(affinity)
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

/**
 * DELETE request to delete user affinities
 * - See src/models/user_affinity_model.ts for the UserAffinity schema
 *
 * @headerparam Authorization is the user's token
 *
 * @returns success
 *
 * @errors
 *         401 // if unauthorized
 *         422 // if affinities is invalid
 *         500 // if server error
 */
router.delete('/user/affinities/', requireAuth, async (req, res) => {
  try {
    const affinity = await UserAffinity.deleteUserAffinities(req.user)
    res.json(affinity)
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

/**
 * GET request to get user affinities by admin
 * - See src/models/user_affinity_model.ts for the UserAffinity schema
 *
 * @headerparam Authorization is the user's token
 *
 * @bodyparam userId // the user id to get the affinities for
 *
 * @returns a json object with user Id, affinities and complexities
 *
 * @errors
 *         401 // if unauthorized
 *         422 // if affinities is invalid
 *         500 // if server error
 */
router.get('/user/affinities/admin', requireAdmin, async (req, res) => {
  try {
    const affinities = await UserAffinity.adminGetUserAffinities(req.body)
    res.json(affinities)
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

export default router
