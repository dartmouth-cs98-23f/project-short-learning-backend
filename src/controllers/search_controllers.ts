/**
 * Controllers for search endpoints
 */

import { logger } from '../services/logger'

import { SearchResult, RankedSearchResults } from '../models/search_models'

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
    const _results = await index.search(query)

    const results: RankedSearchResults = _results.hits.map((hit: any) => {
      return {
        videoId: hit.objectID,
        highlight: hit?._highlightResult?.transcript?.value,
        topics: hit?.topics,
        title: hit?.title,
        description: hit?.description,
      }
    })
    return results
  } catch (error) {
    logger.error(error)
    throw new Error(`SEARCH ERROR: ${error}`)
  }
}

export const searchTopics = async (query: string): Promise<RankedSearchResults> => {
  try {
    const _results = await topicsIndex.search(query)

    const results: RankedSearchResults = _results.hits.map((hit: any) => {
      return {
        videoId: hit.objectID,
        highlight: undefined,
        topics: hit?.topics,
        title: hit?.title,
        description: hit?.description,
      }
    })

    return results
  } catch (error) {
    logger.error(error)
    throw new Error(`SEARCH ERROR: ${error}`)
  }
}
