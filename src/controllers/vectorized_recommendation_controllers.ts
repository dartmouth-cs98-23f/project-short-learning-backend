import { logger } from '../services/logger'
import { Pinecone } from '@pinecone-database/pinecone'
import { VideoRecommendation } from '../models/vectorized_recommendation_model'
import { VideoMetadata, VideoMetadataDocument } from '../models/video_models'
import * as WatchHistory from '../controllers/watch_history_controller'

const PINECONE_API_KEY          = process.env.PINECONE_API_KEY
const PINECONE_INDEX_NAME       = process.env.PINECONE_INDEX_NAME

const pc = new Pinecone({
  apiKey: PINECONE_API_KEY
})

/**
 * getRecommendations
 * 
 * @param videoId videoId of the video to get recommendations from
 * @param userId  userId of the user to get recommendations for
 * @returns a list of VideoRecommendation objects
 */
export const getVideoRecommendations = async (videoId?: string, userId?: string) => {
  
  // error if neither is specified
  try {
    const index = pc.index(PINECONE_INDEX_NAME)

    // const videoVector = response.matches.length > 0 ? response.matches[0].values : []
    const searchVectors = await getSearchVectors(videoId, userId)

    // get recommendations for video_id
    const recommendations = await index.query({
      vector: searchVectors,
      topK: 5,
      includeMetadata: true,
    })
    
    let videoRecommendation: VideoRecommendation = {
      userId: userId.length > 0 ? userId : undefined,
      videos: await Promise.all(recommendations.matches.map(async (match) => {
        // videoId is the id's value except last 4
        const videoId = match.id.slice(0, -4)
        const metadata = await populateVideo(videoId)

        return {
          videoId: match.id.slice(0, -4),
          topics: Array.isArray(match.metadata?.inferenceTopics) ? Array.from(match.metadata.inferenceTopics) : [],
          score: match.score,
          metadata
        }
      }))
    }

    // TODO: rank videos with user affinity
    
    return videoRecommendation
  }
  catch (error) {
    logger.error(error)
    throw new Error(error)
  }
}

async function getSearchVectors(videoId?: string, userId?: string) {
  
  let vectors
  
  try {
    // if videoId is specified, get vectors for video_id
    if (videoId) {
      const index = pc.index(PINECONE_INDEX_NAME)
      
      // get vectors for video_id
      const response = await index.query({
        id: `${videoId}_avg`,
        includeValues: true,
        topK: 1
      })
  
      if (response.matches.length !== 1) {
        throw new Error(`NO VIDEO "${videoId}" FOUND IN PINECONE`)
      }
  
      vectors = response.matches.length > 0 ? response.matches[0].values : []

      return vectors
    }
    else if (userId) {
      // if userId is specified, get vectors for user_id from watch history
      // get watch history for user_id
      const history = await WatchHistory.getWatchHistories({ id: userId }, { limit: 10, order: [['date', 'DESC']] })
      
      const videoId = history.length > 0 ? history[0].videoId : "65d8fc1c95f306b28d1b887b" // TECHNIGALA: WARNING USES HARDCODING 

      const index = pc.index(PINECONE_INDEX_NAME)
      const response = await index.query({
        id: `${videoId}_avg`,
        includeValues: true,
        topK: 1
      })

      if (response.matches.length !== 1) {
        logger.error(`NO VIDEO "${videoId}" FOUND IN PINECONE FOR USER ${userId}`)
        throw new Error(`NO VIDEO "${videoId}" FOUND IN PINECONE FOR USER ${userId}`)
      }
      
      vectors = response.matches.length > 0 ? response.matches[0].values : []
      return vectors

    }
  }
  catch (error) {
    logger.error(error)
    throw new Error(error)
  }
}


/**
 * Get video metadata and populate clips.
 */
async function populateVideo(videoId: any): Promise<VideoMetadataDocument> {
  return await VideoMetadata.findById(videoId)
    .populate('clips')
    .exec()
}
