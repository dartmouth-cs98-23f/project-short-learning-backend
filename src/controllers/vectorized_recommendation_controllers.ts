import { logger } from '../services/logger';
import { Pinecone } from '@pinecone-database/pinecone'
import {
  TopicRecommendation, VideoRecommendation,
  RankingVideoMetadata, RankingTopicMetadata
} from '../models/vectorized_recommendation_model'


const PINECONE_API_KEY          = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME       = process.env.PINECONE_INDEX_NAME;
const PINECONE_INDEX_NAMESPACE  = process.env.PINECONE_INDEX_NAMESPACE;

logger.silly(`{
  PINECONE_API_KEY: ${PINECONE_API_KEY},
  PINECONE_INDEX_NAME: ${PINECONE_INDEX_NAME},
  PINECONE_INDEX_NAMESPACE: ${PINECONE_INDEX_NAMESPACE}
}`)

const pc = new Pinecone({
  apiKey: PINECONE_API_KEY
});

export const getRecommendations = async (videoId: string, userId: string) => {
  try {
    
    const index = pc.index(PINECONE_INDEX_NAME)
    
    // get vectors for video_id
    const response = await index.namespace(PINECONE_INDEX_NAMESPACE).query({
      id: videoId,
      includeValues: true,
      includeMetadata: true,
      topK: 1
    });
    
    logger.silly(`PINECONE response: ${JSON.stringify(response)}`)

    const videoVector = response.matches.length > 0 ? response.matches[0].values : [];
    
    logger.silly(`vector for video-id: ${videoId} is ${videoVector}`)

    // get recommendations for video_id
    const recommendations = await index.namespace(PINECONE_INDEX_NAMESPACE).query({
      vector: videoVector,
      topK: 10,
      includeMetadata: true,
    });

    logger.silly(`recommendations: ${JSON.stringify(recommendations)}`)

    // convert to VideoRecommendation
    logger.silly(`match.medatada: ${JSON.stringify(recommendations.matches[0])}`)
    const videoRecommendation: VideoRecommendation = {
      userId: userId,
      videos: recommendations.matches.map((match) => {
        return {
          videoId: match.id,
          topics: Array.isArray(match.metadata?.topics) ? Array.from(match.metadata.topics) : [],
          score: match.score,
        }
      })
    }

    // rank with user-id

    return videoRecommendation;
  }
  catch (error) {
    logger.error(error);
    console.log(`ERROR: ${JSON.stringify(error)}`)
    throw new Error(`PINECONE ERROR: ${error}`)
  }
}
