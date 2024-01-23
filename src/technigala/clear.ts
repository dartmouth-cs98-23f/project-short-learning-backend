import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { populateTopics, populateVideos } from './populate'
import { TopicMetadata } from '../models/topic_models'
import { VideoMetadata } from '../models/video_models'
import { ClipMetadata } from '../models/clip_models'
import { createTopicVideoFile } from './utils'
import { PrecomputedRecommendations } from '../models/recommendation_models'
import UserModel from '../models/user_model'

dotenv.config()

async function run() {
  try {
    const mongoURI = process.env.MONGODB_URI
    await mongoose.connect(mongoURI)
    console.log('Connected to MongoDB')

    // delete entire database
    await PrecomputedRecommendations.deleteMany({})
    await UserModel.deleteMany({})
    console.log('Dropped users and pre')

    // populate topi

    console.log("done")
  } catch (err) {
    console.error(err)
  }
}

// run()
run()
