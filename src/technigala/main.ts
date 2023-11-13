import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { populateTopics } from './populate'
import { TopicMetadata } from '../models/topic_models'
import { topicMap } from './maps/topic'

dotenv.config()

async function run() {
  try {
    const mongoURI = process.env.MONGODB_URI
    await mongoose.connect(mongoURI)
    console.log('Connected to MongoDB')
    
    // delete entire database
    await TopicMetadata.deleteMany({})
    console.log('Dropped database')

    // populate topics
    console.log(await populateTopics())
  } catch (err) {
    console.error(err)
  }
}

async function test() {
  try {
    const map = topicMap

    console.log(map.get("65515c11fa046a8df1af2fb2"))


  } catch (error) {

  }
}

// run()
test()