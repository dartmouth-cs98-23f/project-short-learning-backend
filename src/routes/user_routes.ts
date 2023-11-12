import { Router } from 'express'
import { requireAuth, requireSignin } from '../services/passport'
import * as User from '../controllers/user_controllers'

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

export default router