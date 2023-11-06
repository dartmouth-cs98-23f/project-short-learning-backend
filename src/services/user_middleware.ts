import mongoose from 'mongoose'
import { Recommendation } from '../models/recommendation_models'
import { validatePlaylist, validateUser } from '../utils/playlist_validate'
import { RequestHandler } from 'express'

/**
 * This is express middleware that validates the userId and recommedation sequence
 *
 * @param userId
 * @param sequence
 */
export const validateSequence: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.body.userId
    const sequence = req.body.sequence
    for (var i = 0, len = sequence.length; i < len; i++) {
      const playlistId = sequence[i].videoId
      const videoIndex = sequence[i].clipIndex

      const valid = await validatePlaylist(playlistId, videoIndex)
      if (!valid) {
        throw new Error('Invalid sequence')
      }
    }
    if (!validateUser(userId)) {
      throw new Error('Invalid user')
    }

    next()
  } catch (error) {
    res.status(422).send({ message: error.toString() })
  }
}
