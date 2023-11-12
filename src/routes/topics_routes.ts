import { Request, Router } from 'express'
import { TopicMetadata, UpdateTopicBodyParams } from '../models/topic_models'
import { requireAdmin } from '../services/passport'
import { logger } from '../services/logger'

const topicRouter = Router()


/**
 * GET request to get topic metadata
 * 
 * @optionalqueryparam topicId: ObjectId // the topicId of the topic to get
 * @optioanlqueryparam combinedTopicName: string // the topicName of the topic to get
 * 
 * @returns message // a message indicating success or failure
 *          topic: TopicMetadataDocument // the topic model - see topic_models.ts
 * 
 */
topicRouter.get('/topics', requireAdmin, async (req, res) => {
  try {
    const { topicId, combinedTopicName } = req.query

    if (!topicId && !combinedTopicName) {
      return res.status(422).json({ message: 'Missing topicId or combinedTopicName' })
    }

    let topic
    if (topicId) {
      topic = await TopicMetadata.findById(topicId)
    } else if (combinedTopicName) {
      topic = await TopicMetadata.findOne({ combinedTopicName })
    }

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' })
    }

    res.status(200).json({ message: 'Success', topic: topic })
  } catch (error) {
    res.status(422).send({ error: error.toString() })
  }
})

/**
 * POST request to update a topic
 * 
 * @bodyparam topicName: string // the topicName of the topic to update
 * @optionalbodyparam subTopicName: string // the subTopicName of the topic to update
 * @bodyparam description: string // the description of the topic to update
 * @optionalbodyparam thumbnailURL: string // the thumbnailURL of the topic to update
 * 
 * @returns message // a message indicating success or failure
 *          topic // the topic model - see topic_models.ts
 */
topicRouter.post(
  '/topics',
  requireAdmin,
  async (req: Request<{}, {}, UpdateTopicBodyParams>, res) => {
    try {
      const topicName = req.body.topicName
      const description = req.body.description
      const subTopicName = req.body.subTopicName || ''
      const thumbnailURL = req.body.thumbnailURL || ''

      const topic = await TopicMetadata.create({
        topicName: topicName,
        description: description,
        subTopicName: subTopicName,
        thumbnailURL: thumbnailURL,
        combinedTopicName: `${topicName}/${subTopicName}`
      })

      res.status(200).json({ message: 'Success', topic: topic })
    } catch (error) {
      res.status(422).send({ message: error.toString() })
    }
  }
)


/**
 * DELETE request to delete a topic
 * 
 * @pathparam topicId: ObjectId // the topicId of the topic to delete
 */
topicRouter.delete('/topics', requireAdmin, async (req, res) => {
  try {
    const topicId = req.body.topicId
    const combinedTopicName = req.body.combinedTopicName

    if (!topicId && !combinedTopicName) {
      return res.status(422).json({ message: 'Missing topicId or combinedTopicName' })
    }

    var topic
    if (topicId) {
      topic = await TopicMetadata.findByIdAndDelete(topicId)
    } else if (combinedTopicName) {
      topic = await TopicMetadata.findOneAndDelete({ combinedTopicName })
    }

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' })
    }

    logger.info(`Deleted topic: ${topicId || combinedTopicName}`)

    return res.status(200).json({ message: 'Success, topic deleted' })

  } catch (error) {
    res.status(422).send({ message: error.toString() })
  }
})

export default topicRouter
