import { Router } from 'express'
import * as VideoAffinity from '../controllers/video_affinity_controller'
const videoRouter = Router()

/**
 * GET request to get video affinities
 * - See src/models/video_affinity_model.ts for the VideoAffinity schema
 *
 * @pathparam videoId // the videoId of the video to get affinity for
 *
 * @returns videoAffinity // the video affinity of the video
 *
 * @errors 422 // if videoId is missing
 *         404 // if video is not found
 *         500 // if server error
 */
videoRouter.get('/video/:videoId/affinities', async (req, res) => {
  try {
    const videoAffinity = await VideoAffinity.getVideoAffinities(req.params.videoId);
    return res.json(videoAffinity);
  } catch (error) {
    return res.status(422).json({ message: error.toString() })
  }
});

/**
 * POST request to create video affinities
 * - See src/models/video_affinity_model.ts for the VideoAffinity schema
 *
 * @pathparam videoId // the videoId of the video to update affinity for
 * @bodyparam affinities // the affinities to update
 *
 * @returns videoAffinity // the updated video affinity of the video
 *
 * @errors 422 // if videoId or affinities is missing
 *         404 // if video is not found
 *         500 // if server error
 */
videoRouter.post('/video/:videoId/affinities', async (req, res) => {
  try {
    const videoAffinity = await VideoAffinity.createVideoAffinity(req.params.videoId, req.body);
    return res.json(videoAffinity);
  } catch (error) {
    return res.status(422).json({ message: error.toString() })
  }
});

/**
 * PUT request to update video affinities
 * - See src/models/video_affinity_model.ts for the VideoAffinity schema
 *
 * @pathparam videoId // the videoId of the video to update affinity for
 * @bodyparam affinities // the affinities to update
 *
 * @returns videoAffinity // the updated video affinity of the video
 *
 * @errors 422 // if videoId or affinities is missing
 *         404 // if video is not found
 *         500 // if server error
 */

videoRouter.put('/video/:videoId/affinities', async (req, res) => {
  try {
    const videoAffinity = await VideoAffinity.updateVideoAffinities(req.params.videoId, req.body);
    return res.json(videoAffinity);
  } catch (error) {
    return res.status(422).json({ message: error.toString() })
  }
});

/**
 * DELETE request to delete video affinities
 * - See src/models/video_affinity_model.ts for the VideoAffinity schema
 * 
 * @pathparam videoId // the videoId of the video to delete a comment from
 * 
 * @returns message // a message indicating success or failure
 * 
 * @errors 422 // if videoId or commentId is missing
 *         404 // if video or comment is not found
 *         500 // if server error
 * 
 */
videoRouter.delete('/video/:videoId/affinities', async (req, res) => {
  try {
    const success = await VideoAffinity.deleteVideoAffinities(req.params.videoId);
    return res.json({ success });
  } catch (error) {
    return res.status(422).json({ message: error.toString() })
  }
});

export default videoRouter;