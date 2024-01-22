import mongoose from 'mongoose';
import VideoAffinity from '../models/video_affinity_model'
import WatchHistory from "../models/watch_history_models"

export const getDashboardData = async (user) => {
  try {
    // Loop through all of the videos in the watch history and get the video affinity for each video
    const watchHistory = await WatchHistory.find({ userId: user.id }, { id: 0, _id: 0, __v: 0 }, { sort: { date: -1 } });

    const videoAffinity = []
    for (const video of watchHistory) {
      const videoAffinityData = await VideoAffinity.findOne({ videoId: video.videoId })
      videoAffinity.push(videoAffinityData)
    }
    console.log(videoAffinity)
    
    // Get the affinity for each topic/subtopic and normalize it by the number of videos to 1
    const topicAffinity = new Map()
    const subtopicAffinity = new Map()
    let totalTopicAffinity = 0
    let totalSubtopicAffinity = 0
    for (const video of videoAffinity) {
      for (const [key, value] of video.affinities) {
        const [topic, subtopic] = key.split('/')
        if (topicAffinity.has(topic)) {
          topicAffinity.set(topic, topicAffinity.get(topic) + value)
        } else {
          topicAffinity.set(topic, value)
        }
        if (subtopicAffinity.has(subtopic)) {
          subtopicAffinity.set(subtopic, subtopicAffinity.get(subtopic) + value)
        } else {
          subtopicAffinity.set(subtopic, value)
        }
        totalSubtopicAffinity += value
        totalTopicAffinity += value
      }
    }

    // Normalize the affinity for all the topics so they sum up to 1
    const topicAffinityNormalized = {}
    const subtopicAffinityNormalized = {}

    for (const [topic, value] of topicAffinity) {
    topicAffinityNormalized[topic] = value / totalTopicAffinity
    }

    for (const [subtopic, value] of subtopicAffinity) {
    subtopicAffinityNormalized[subtopic] = value / totalSubtopicAffinity
    }

    return {
      topicAffinity: topicAffinityNormalized,
      subtopicAffinity: subtopicAffinityNormalized
    }

  } catch (error) {
    throw new Error(`Get dashboard data error: ${error}`)
  }
}