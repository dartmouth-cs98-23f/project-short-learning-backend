import { logger } from '../services/logger';
import { Pinecone } from '@pinecone-database/pinecone'
import {
  TopicRecommendation, VideoRecommendation,
  RankingVideoMetadata, RankingTopicMetadata
} from '../models/vectorized_recommendation_model'
import { VideoResult } from '../models/search_models';
import { VideoMetadata, VideoMetadataDocument } from '../models/video_models';

const PINECONE_API_KEY          = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME       = process.env.PINECONE_INDEX_NAME;

const pc = new Pinecone({
  apiKey: PINECONE_API_KEY
});

/**
 * getRecommendations
 * 
 * @param videoId videoId of the video to get recommendations from
 * @param userId  userId of the user to get recommendations for
 * @returns a list of VideoRecommendation objects
 */
export const getVideoRecommendations = async (videoId: string, userId: string) => {
  try {
    
    const index = pc.index(PINECONE_INDEX_NAME)

    // list indices
    const indices = await pc.listIndexes();
    
    // get vectors for video_id
    const response = await index.query({
      id: `${videoId}_max`,
      includeValues: true,
      topK: 1
    });
    
    logger.silly(`PINECONE response: ${JSON.stringify(response)}`)

    if (response.matches.length !== 1) {
      throw new Error(`NO VIDEO "${videoId}" FOUND IN PINECONE`)
    }

    const videoVector = response.matches.length > 0 ? response.matches[0].values : [];
    
    logger.silly(`vector for video-id: ${videoId} is ${videoVector}`)

    // get recommendations for video_id
    const recommendations = await index.query({
      vector: videoVector,
      topK: 30,
      includeMetadata: true,
    });

    
    let videoRecommendation: VideoRecommendation = {
      userId: userId.length > 0 ? userId : undefined,
      videos: await Promise.all(recommendations.matches.map(async (match) => {
        const metadata = await populateVideo(videoId);
        return {
          videoId: match.id.slice(0, -4),
          topics: Array.isArray(match.metadata?.inferenceTopics) ? Array.from(match.metadata.inferenceTopics) : [],
          score: match.score,
          metadata
        }
      }))
    }

    // TODO: rank videos with user affinity
    
    return videoRecommendation;
  }
  catch (error) {
    logger.error(error);
    throw new Error(error)
  }
}



async function populateVideo(videoId: any): Promise<VideoMetadataDocument> {
  return await VideoMetadata.findById(videoId)
    .populate('clips')
    .exec()
    .then( (metadata) => metadata)
}
