import { Pinecone } from '@pinecone-database/pinecone'
import {
  TopicRecommendation, VideoRecommendation,
  RankingVideoMetadata, RankingTopicMetadata
} from '../models/vectorized_recommendation_model'


const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const PINECONE_INDEX_NAMESPACE = process.env.PINECONE_INDEX_NAMESPACE;

const pc = new Pinecone({
  apiKey: PINECONE_API_KEY
});

export const getRecommendations = async (videoId, userId, ) => {

  try {
    
    const id = videoId;
    const index = pc.index(PINECONE_INDEX_NAME) // .namespace(PINECONE_INDEX_NAMESPACE);

    console.log(`Getting recommendations for video_id: ${id}`);
    
    // get vectors for video_id
    const response = await index.query(id);
    console.log(`response: ${JSON.stringify(response)}`)
    const videoVector = (await index.query(id)).matches[0].values;

    console.log(`vector for video_id: ${id} is ${videoVector}`)

    // get recommendations for video_id
    const recommendations = await index.query({ vector: videoVector, topK: 10 });

    // convert to VideoRecommendation
    const videoRecommendation: VideoRecommendation = {
      userId: userId,
      videos: recommendations.matches.map((match) => {
        return {
          videoId: match.id,
          topics: Array.isArray(match.metadata.topics) ? Array.from(match.metadata.topics) : [],
          score: match.score,
        }
      })
    }

    // rank with user-id

    return videoRecommendation;
  }
  catch (error) {
    throw new Error(`PINECONE ERROR: ${error}`)
  }
}
