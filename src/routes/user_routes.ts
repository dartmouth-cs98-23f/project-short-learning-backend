import { Request, Response, Router } from 'express'
import { requireAuth, requireSignin } from '../services/passport'
import * as User from '../controllers/user_controllers'
import { randomUUID } from 'crypto'
import UserModel from '../models/user_model'
import { VideoMetadataDocument } from '../models/video_models'
import { logger } from '../services/logger'

const router = Router()

/**
 *
 * POST /auth/signup
 * POST /auth/signin
 * GET /user
 * PUT /user
 * DELETE /user
 * POST /user/verify
 * POST /user/resend
 */

/**
 * POST request to sign up user
 *  - See src/models/user_model.ts for the User schema
 *
 * @bodyparam firstName is the user's first name
 * @bodyparam lastName is the user's last name
 * @bodyparam email is the user's email
 * @bodyparam username is the user's username
 * @bodyparam password is the user's password
 * @bodyparam birthDate is the user's birth date
 * @returns a json object with a token for auth
 *
 * @errors 200 if success
 *         422 if invalid email or password
 *         500 if server error
 */
router.post('/auth/signup', async (req, res) => {
  try {
    const token = await User.signup(req.body)
    return res.json({ token })
  } catch (error) {
    return res.status(422).send(error.message)
  }
})

/**
 * POST request to sign in user
 *  - See src/models/user_model.ts for the User schema
 *
 * @bodyparam email is the user's email
 * @bodyparam password is the user's password
 *
 * @returns a json object with a token for auth
 *
 * @errors 200 if success
 *         401 if invalid email or password
 *         422 if invalid email or password
 *         500 if server error
 */
router.post('/auth/signin', requireSignin, async (req, res) => {
  try {
    const token = User.signin(req.user)
    res.json({ token })
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

/**
 * GET request to get user
 *  - See src/models/user_model.ts for the User schema
 *
 * @headerparam Authorization is the user's token
 *
 * @returns user information through user object
 *
 * @errors 200 if success
 *         401 if invalid token
 *         422 if problem getting user
 *         500 if server error
 */
router.get('/user', requireAuth, async (req, res) => {
  try {
    const user = await User.getUser(req.user)
    res.json(user)
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

const checkPassword = (req, res, next) => {
  if (req.body.password) {
    // If the request includes a password, require sign-in
    if (!req.body.email) {
      return res
        .status(422)
        .send({ error: 'Email is required to change password' })
    }
    requireSignin(req, res, next)
  } else {
    // If no password is included, require authentication
    requireAuth(req, res, next)
  }
}

/**
 * PUT request to update user
 * - See src/models/user_model.ts for the User schema
 *
 * @headerparam Authorization is the user's token
 *
 * @bodyparam firstName is the user's first name
 * @bodyparam lastName is the user's last name
 * @bodyparam email is the user's email
 * @bodyparam username is the user's username
 * @bodyparam password is the user's password
 * @bodyparam newPassword is the user's new password
 * @bodyparam birthDate is the user's birth date
 * @bodyparam onBoardingStatus is the user's onBoardingStatus
 * @bodyparam profilePicture is the user's profilePicture
 *
 */
router.put('/user', checkPassword, async (req, res) => {
  try {
    const user = await User.updateUser(req.user, req.body)
    res.json(user)
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

/**
 * DELETE request to delete user
 * - See src/models/user_model.ts for the User schema
 *
 * @body email is the user's email
 * @body password is the user's password
 *
 * @returns success
 *
 * @errors
 *         401 // if unauthorized
 *         422 // if affinities is invalid
 */
router.delete('/user', requireSignin, async (req, res) => {
  try {
    const user = await User.deleteUser(req.user)
    res.json(user)
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

/**
 * POST request to verify user
 * - See src/models/user_model.ts for the User schema
 *
 * @headerparam Authorization is the user's token
 *
 * @bodyparam emailVerificationCode is the user's emailVerificationCode
 *
 * @returns success
 *
 * @errors
 *         401 // if unauthorized
 *         422 // if affinities is invalid
 */
router.post('/user/verify', requireAuth, async (req, res) => {
  try {
    const verified = await User.verifyUser(req.user, req.body)
    res.json(verified)
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

/**
 * POST request to resend verification email
 * - See src/models/user_model.ts for the User schema
 *
 * @headerparam Authorization is the user's token
 *
 * @returns success
 *
 * @errors
 *         401 // if unauthorized
 *         422 // if affinities is invalid
 */
router.post('/user/resend', requireAuth, async (req, res) => {
  try {
    const sent = await User.sendVerificationEmail(req.user)
    res.json(sent)
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

/**
 * This is a technigala route used for sign in
 *
 * @bodyparam firstName is the user's first name
 * @bodyparam lastName is the user's last name
 *
 * @returns token // a jwt token for auth
 *          status // "onboarding" | "onboarded" | string
 */

router.post(
  '/user/technigala/signin',
  async (
    req: Request<{}, {}, { firstName: string; lastName: string }>,
    res: Response<{
      token?: string
      status?: 'onboarding' | 'onboarded' | string
    }>
  ) => {
    logger.debug('asd')
    try {
      // check user status
      const username = `${String(req.body.firstName).toLowerCase()}.${String(req.body.lastName).toLowerCase()}`
      const userMetadata = await UserModel.findOne({ username: username })

      // if user is a new account, create a new user
      if (!userMetadata) {
        const user = await UserModel.create({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: `${randomUUID()}@technigala.com`,
          username: username,
          onBoardingStatus: 'onboarding'
        })
        if (!user) throw new Error('User not created')
        return res
          .status(200)
          .json({ token: User.tokenForUser(user), status: 'onboarding' })
      }

      // if user is an existing account, return login and status "onboarding | onboarded"
      const status =
        userMetadata.onBoardingStatus === 'onboarded'
          ? 'onboarded'
          : 'onboarding'
      return res
        .status(200)
        .json({ token: User.tokenForUser(userMetadata), status: status })
    } catch (error) {
      return res.status(500).send(error.message)
    }
  }
)

/**
 * This is a technigala route used for onboarding
 *
 * @bodyparam topics: string[] // an array of any "coffee", "homedesign", "secondpunicwar", "mathematics", "artsandcrafts", "cars"
 *
 * @returns playlists: an array of VideoMetadataDocuments
 */
router.post(
  '/user/technigala/onboard',
  requireAuth,
  async (
    req: Request<{}, {}, { topics: string[] }>,
    res: Response<{ playlists?: VideoMetadataDocument[]; message?: string }>
  ) => {
    try {
      const realTopics = [
        'coffee',
        'homedesign',
        'secondpunicwar',
        'mathematics',
        'artsandcrafts',
        'cars'
      ]

      const topics = req.body.topics

      const userId = req.user._id
      const userMetadata = await UserModel.findById(userId)
      if (!userMetadata)
        return res.status(404).json({ message: 'User not found' })

      // each topic, a precomputed list of videos will be loaded in for each sub topic (e.g. coffee -> coffee brewing, coffee roasting, etc.)
      // they need to exist already in the database as IDs
      // videos already need to exist as well for the mapping to happen
      // if user is an existing account, update user

      for (const topic of topics) {
        if (!(topic in realTopics)) {
          return res.status(422).json({
            message: `${topic} is not a topic, topics: ${realTopics}, check formatting?`
          })
        }
      }

      return res.status(200).json({
        playlists: [],
        message: `Successfully onboarded, topics recieved: ${topics}, some playlists will be returned but not at this time`
      })
    } catch (error) {
      logger.error(error)
      return res.status(500).send(error.message)
    }
  }
)

export default router
