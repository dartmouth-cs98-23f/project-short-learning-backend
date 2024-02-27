/**
 * Controllers for search endpoints
 */

import { logger } from '../services/logger'

import { TopicResult, RankedSearchResults, VideoResult } from '../models/search_models'

import algoliasearch from 'algoliasearch'

const appID           = process.env.ALGOLIA_SEARCH_APP_ID
const apiKey          = process.env.ALGOLIA_SEARCH_API_KEY
const indexName       = process.env.ALGOLIA_SEARCH_INDEX_NAME
const topicsIndexName = process.env.ALGOLIA_SEARCH_TOPICS_INDEX_NAME

const client = algoliasearch(appID, apiKey);
const index = client.initIndex(indexName);
const topicsIndex = client.initIndex(topicsIndexName);

export const searchTranscript = async (query: string): Promise<RankedSearchResults> => {
  try {
    return index.search(query).then((res) => {

      const topics = accumulateTopics(res.hits)
      const videos = accumulateVideos(res.hits)

      return { videos, topics: topics.slice(0, 10) }
    })
  } catch (error) {
    logger.error(error)
    throw new Error(`SEARCH ERROR: ${error}`)
  }
}

export const searchTopics = async (query: string): Promise<RankedSearchResults> => {
  try {
    return topicsIndex.search(query).then((res) => {

      const topics = accumulateTopics(res.hits)
      const videos = accumulateVideos(res.hits)

      return { videos, topics: topics.slice(0, 10) }
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

function accumulateVideos (results: any): VideoResult[] {
  return results.map((hit: any) => ({
      videoId: hit.objectID,
      highlight: undefined,
      topics: hit?.topics,
      title: hit?.title,
      description: hit?.description,
    })
  )
}
