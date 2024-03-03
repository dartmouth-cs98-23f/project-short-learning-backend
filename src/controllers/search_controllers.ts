/**
 * Controllers for search endpoints
 */

import { logger } from '../services/logger'
import { TopicResult, RankedSearchResults, VideoResult } from '../models/search_models'
import algoliasearch from 'algoliasearch'
import { VideoMetadata } from '../models/video_models'
import UserModel from '../models/user_model'

const appID           = process.env.ALGOLIA_SEARCH_APP_ID
const apiKey          = process.env.ALGOLIA_SEARCH_API_KEY
const indexName       = process.env.ALGOLIA_SEARCH_INDEX_NAME
const topicsIndexName = process.env.ALGOLIA_SEARCH_TOPICS_INDEX_NAME

const client = algoliasearch(appID, apiKey);
const index = client.initIndex(indexName);
const topicsIndex = client.initIndex(topicsIndexName);

export const searchTranscript = async (query: string): Promise<RankedSearchResults> => {
  try {
    return index.search(query).then( async (res) => {

      let topics = await accumulateTopics(res.hits)
      let videos = await accumulateVideos(res.hits)

      return { videos, topics: topics.slice(0, 10) }
    })
  } catch (error) {
    logger.error(error)
    throw new Error(`SEARCH ERROR: ${error}`)
  }
}

export const searchTopics = async (query: string): Promise<RankedSearchResults> => {
  try {
    return topicsIndex.search(query).then(async (res) => {

      const topics = await accumulateTopics(res.hits)
      const videos = await accumulateVideos(res.hits)

      return { videos, topics: topics.slice(0, 10) }
    })
  } catch (error) {
    logger.error(error)
    throw new Error(`SEARCH ERROR: ${error}`)
  }
}

export const searchUser = async (query: string) => {
  try {
    // search for user in user model (firs name, last name, username, email)
    const users = await UserModel.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' }},
        { lastName: { $regex: query, $options: 'i' }},
        { username: { $regex: query, $options: 'i' }},
        { email: { $regex: query, $options: 'i' }}
      ]
    })
    
    // filter out sensitive information
    return users.map((user) => {
      return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    logger.error(error)
    throw new Error(`SEARCH ERROR: ${error}`)
  }
}

function accumulateTopics(results: any): TopicResult[] {
  
  let _topics = new Map<string, number>()

  results.forEach((result: any) => {
    result.topics.forEach((topic: any) => {
      _topics[topic] = _topics[topic] || 0
      _topics[topic] += 1
    })
  })

  let sortedArray = []
  for (let k in _topics) {
    const v = _topics[k]
    sortedArray.push({k, v})
  }

  sortedArray.sort((a, b) => b.v - a.v)

  let topics: TopicResult[] = sortedArray.map((topic) => {
    return {
      topic: topic["k"],
      score: topic["v"]
    }
  })
  return topics
}

async function accumulateVideos(results: any): Promise<VideoResult[]> {
  const res = await Promise.all(results.map( async (hit: any) => {
    return await VideoMetadata.findById(hit.objectID)
      .populate('clips')
      .exec()
      .then( (metadata) => {
        return {
          videoId: hit.objectID,
          // highlight: hit._highlightResult,
          topics: hit?.topics,
          title: hit?.title,
          description: hit?.description,
          metadata: metadata
        }
      })
  }))
  return res
}
