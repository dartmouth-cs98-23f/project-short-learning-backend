import mongoose from 'mongoose'
import { VideoMetadata, VideoMetadataDocument } from '../models/video_models'
import { logger } from '../services/logger'
import UserModel, { UserDocument } from '../models/user_model'

/**
 * Validates that a given playlist is in the database and if the videoIndex is valid
 *
 * @param playlistId
 * @param videoIndex or 0 if not provided
 */
export const validatePlaylist = async (
  playlistId: mongoose.Types.ObjectId,
  videoIndex: number = 0
): Promise<boolean> => {
  try {
    const playlist: VideoMetadataDocument =
      await VideoMetadata.findById(playlistId)
    if (!playlist) {
      throw new Error('Playlist not found')
    }
    if (videoIndex >= playlist.clips.length) {
      throw new Error('Video index out of bounds')
    }
    return true
  } catch (error) {
    logger.warn('Validation Middleware Error: ' + error)
    return false
  }
}

export const validateUser = async (userId: mongoose.Types.ObjectId): Promise<boolean> => {
    try {
        const user: UserDocument = await UserModel.findById(userId)
        if (!user) {
            throw new Error('User not found')
        }
        return true
    } catch (error) {
        logger.warn('Validation Middleware Error: ' + error)
        return false
    }
}
