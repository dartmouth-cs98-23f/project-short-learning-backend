/**
 * Controllers for search endpoints
 */

import { logger } from '../services/logger'
import {
  TopicResult,
  RankedSearchResults,
  VideoResult
} from '../models/explore_models'
import algoliasearch from 'algoliasearch'
import { VideoMetadata } from '../models/video_models'
import UserModel from '../models/user_model'
import { Pinecone } from '@pinecone-database/pinecone'
import { roleAffinities, roleTopics } from '../utils/roles'
import { indexedMap, reverseIndexedMap } from '../utils/topics'
import UserAffinityModel from '../models/user_affinity_model'
import { CLIP_POP_LIMIT } from '../utils/globals'

const PAGE_SIZE = 8

const appID = process.env.ALGOLIA_SEARCH_APP_ID
const apiKey = process.env.ALGOLIA_SEARCH_API_KEY
const indexName = process.env.ALGOLIA_SEARCH_INDEX_NAME
const topicsIndexName = process.env.ALGOLIA_SEARCH_TOPICS_INDEX_NAME
const PINECONE_API_KEY = process.env.PINECONE_API_KEY
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME
const PINECONE_INDEX_NAME_TOPICS = process.env.PINECONE_INDEX_NAME_TOPICS

const client = algoliasearch(appID, apiKey)
const index = client.initIndex(indexName)
const topicsIndex = client.initIndex(topicsIndexName)

const pineconeClient = new Pinecone({
  apiKey: PINECONE_API_KEY
})

export const searchTranscript = async (
  query: string
): Promise<RankedSearchResults> => {
  if (!query) {
    return { videos: [], topics: [] }
  }

  try {
    return index.search(query).then(async (res) => {
      let topics = await accumulateTopics(res.hits)
      let videos = await accumulateVideos(res.hits)

      return { videos, topics: topics.slice(0, 10) }
    })
  } catch (error) {
    logger.error(error)
    throw new Error(`SEARCH ERROR: ${error}`)
  }
}

export const searchTopics = async (
  query: string
): Promise<RankedSearchResults> => {
  if (!query) {
    return { videos: [], topics: [] }
  }

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
  if (!query) {
    return { users: [] }
  }

  try {
    // search for user in user model (firs name, last name, username, email)
    const users = await UserModel.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
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

export const searchAll = async (query) => {
  try {
    const queries = [
      searchTranscript(query.q),
      searchTopics(query.topic),
      searchUser(query.user)
    ]

    const results: any = await Promise.all(queries)

    const videos = results[0].videos.concat(results[1].videos)
    const topics = results[0].topics.concat(results[1].topics)
    const users = results[2]

    return { videos, topics, users }
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
  logger.debug(results)

  let sortedArray = []
  for (let k in _topics) {
    const v = _topics[k]
    sortedArray.push({ k, v })
  }

  sortedArray.sort((a, b) => b.v - a.v)

  let topics: TopicResult[] = sortedArray.map((topic) => {
    return {
      topic: topic['k'],
      score: topic['v']
    }
  })
  return topics
}

async function accumulateVideos(results: any): Promise<VideoResult[]> {
  const res = await Promise.all(
    results.map(async (hit: any) => {
      return await VideoMetadata.findById(hit.objectID)
        .populate({ path: 'clips', options: { limit: CLIP_POP_LIMIT } })

        .exec()
        .then((metadata) => {
          return {
            videoId: hit.objectID,
            // highlight: hit._highlightResult,
            topics: hit?.topics,
            title: hit?.title,
            description: hit?.description,
            metadata: metadata
          }
        })
    })
  )
  return res
}

export const getTopRoles = async (userId: string) => {
  try {
    const roles = Object.keys(roleAffinities)
    const userAffinityDoc = await UserAffinityModel.findOne({
      userId: userId
    })
    const userAffinities = userAffinityDoc.affinities
    const rankings: { [key: string]: number } = {}
    roles.forEach((role) => {
      rankings[role] = 0
    })

    Object.entries(roleAffinities).forEach(([role, affinities]) => {
      Object.keys(indexedMap).forEach((topic) => {
        rankings[role] += affinities[topic] * userAffinities.get(topic)
      })
      logger.debug(`role: ${role}, ranking: ${rankings[role]}`)
    })
    const sorted = Object.keys(rankings).sort(
      (a, b) => rankings[b] - rankings[a]
    )
    return sorted
  } catch (error) {
    logger.error(error)
  }
}

export const getTopTopics = async (userId: string, limit: number) => {
  try {
    const userAffinityDoc = await UserAffinityModel.findOne({
      userId: userId
    }).lean()
    const userAffinities = userAffinityDoc.affinities
    const sorted = Object.keys(userAffinities).sort(
      (a, b) => userAffinities[b] - userAffinities[a]
    )
    return sorted.slice(0, limit)
  } catch (error) {
    logger.error(error)
  }
}
// To get topic to return, get their {page} % 6 best topic
export const getExplore = async (userId: string, page: number) => {
  try {
    const roles = await getTopRoles(userId) // This looks weird, check why QA first tomorrow?
    const topics = await getTopTopics(userId, page)
    const topicVideos = await getTopicVideos(
      userId,
      topics[(page - 1) % topics.length],
      1
    )
    const roleVideos = await getRoleVideos(
      userId,
      roles[(page - 1) % roles.length],
      1
    )
    return { roleVideos, topicVideos }
  } catch (error) {
    logger.error(error)
  }
}

export const getRoleVideos = async (
  userId: string,
  role: string,
  page: number
) => {
  try {
    const videosPerTopic = 4
    const topics = roleTopics[role]
    logger.debug(topics)
    // Grab top two topics based on page TODO LATER IF LONG SCROLL
    // const topic1 = topics[(page - 1) % roleTopics.length * 2 % topics.length]
    // const topic2 = topics[(page - 1) * 2 % topics.length + 1]

    const topic1 = topics[Math.floor(Math.random() * topics.length)]
    const topic2 = topics[Math.floor(Math.random() * topics.length)]

    const topic1Videos = await getTopicVideos(userId, topic1, 1, videosPerTopic)
    const topic2Videos = await getTopicVideos(userId, topic2, 1, videosPerTopic)

    const videos = topic1Videos.concat(topic2Videos)

    return videos
  } catch (error) {
    logger.error(error)
  }
}

// TODO: CACHING AND USER HISTORY
export const getTopicVideos = async (
  userId: string,
  topicId: string,
  page: number,
  pageSize: number = PAGE_SIZE
) => {
  try {
    const topicIndex = pineconeClient.index(PINECONE_INDEX_NAME_TOPICS)
    const index = pineconeClient.index(PINECONE_INDEX_NAME)

    const avgVectorId = `${topicId}_avg`
    const response = await topicIndex.fetch([avgVectorId])
    const avgTopicRecord = response.records[avgVectorId]

    const searchResponse = await index.query({
      vector: avgTopicRecord.values,
      topK: pageSize * page,
      includeMetadata: true,
      filter: { topics: { $in: [topicId] } }
    })

    const videos = await Promise.all(
      searchResponse.matches.map(async (match) => {
        const videoId = match.id.slice(0, -4)
        const metadata = await VideoMetadata.findById(videoId)
          .populate({ path: 'clips', options: { limit: 10 } })

          .exec()
        return metadata
      })
    )
    return videos.slice((page - 1) * pageSize, page * pageSize)
  } catch (error) {
    logger.error(error)
  }
}

export const getTopicGraphValues = async (topicId: string) => {
  try {
    const graphValues: number[] = []
    const convertedTopicId = reverseIndexedMap[topicId]
    Object.entries(roleAffinities).forEach(([_, affinities]) => {
      graphValues.push(affinities[convertedTopicId])
    })
    return graphValues
  } catch (error) {
    logger.error(error)
  }
}
