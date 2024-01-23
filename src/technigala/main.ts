import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { populateTopics, populateVideos } from './populate'
import { TopicMetadata } from '../models/topic_models'
import { VideoMetadata } from '../models/video_models'
import { ClipMetadata } from '../models/clip_models'
import { createTopicVideoFile } from './utils'

dotenv.config()

async function run() {
  try {
    const mongoURI = process.env.MONGODB_URI
    await mongoose.connect(mongoURI)
    console.log('Connected to MongoDB')

    // delete entire database
    await TopicMetadata.deleteMany({})
    await VideoMetadata.deleteMany({})
    await ClipMetadata.deleteMany({})
    console.log('Dropped database')

    // populate topics
    const res = await populateTopics() as any

    const topicToVideos = await populateVideos(res[0], res[1])

    createTopicVideoFile('topicToVideos', topicToVideos)

    console.log("done")
  } catch (err) {
    console.error(err)
  }
}

// run()
run()
