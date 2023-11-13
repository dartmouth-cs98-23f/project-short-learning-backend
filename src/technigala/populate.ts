import { TopicMetadata, TopicMetadataDocument } from '../models/topic_models'
import { PopTopicsDocument, topicDocuments } from './data/topics'
import { createFile } from './utils'

// Read in topics from data/topics.json
export const populateTopics = async () => {
  try {
    // maps ids to combinednames and vice versa
    const topicMap = new Map<string, string>()
    const topics: PopTopicsDocument[] = topicDocuments
    for (const topic of topics) {
      const metadata: TopicMetadataDocument = await TopicMetadata.create({
        topicName: topic.topicName,
        subTopicName: topic.subTopicName,
        thumbnailURL: topic.thumbnailurl,
        combinedTopicName: `${topic.topicName}/${topic.subTopicName}`
      })

      // add to map
      topicMap.set(metadata._id, metadata.combinedTopicName)
      topicMap.set(metadata.combinedTopicName, metadata._id)
    }
    createFile('topic', topicMap)
    return "Finished topics population"
  } catch (error) {
    console.log(error)
  }
}

