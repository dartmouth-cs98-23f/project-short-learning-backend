import VideoAffinity from '../models/video_affinity_model'
import WatchHistory from "../models/watch_history_models"
import UserModel from "../models/user_model"

export const getDashboardData = async (user, queryParameters) => {
  try {
    // Loop through all of the videos in the watch history and get the video affinity for each video
    const { 'date.gt': dateGt, 'date.lt': dateLt, limit: queryLimit } = queryParameters;

    const limit = queryLimit ? parseInt(queryLimit) : 500;

    let query: any = { userId: user.id };

    const dateFilter: { $gte?: Date; $lt?: Date } = {
      ...(dateGt ? { $gte: new Date(dateGt) } : {}),
      ...(dateLt ? { $lt: new Date(dateLt) } : {}),
    };

    if (dateGt || dateLt) {
      query.date = dateFilter;
    }

    const watchHistory = await WatchHistory.find(query, { _id: 0, __v: 0 }, { sort: { date: -1 }, limit: limit });

    const videoAffinity = []
    for (const video of watchHistory) {
      const videoAffinityData = await VideoAffinity.findOne({ videoId: video.videoId })
      videoAffinity.push(videoAffinityData)
    }
    
    // Get the affinity for each topic/subtopic and normalize it by the number of videos to 1
    const topicAffinity = new Map()

    for (const video of videoAffinity) {
      for (const topic of video.affinities.keys()) {
        if (topicAffinity.has(topic)) {
          topicAffinity.set(topic, topicAffinity.get(topic) + 1)
        } else {
          topicAffinity.set(topic, 1)
        }
      }
    }

    return {
      topicAffinity
    }

  } catch (error) {
    throw new Error(`Get dashboard data error: ${error}`)
  }
}

export const adminGetDashboardData = async ({ userId }, query) => {
  try {
    const user = await UserModel.findById(userId);

    if(!user) {
      throw new Error('User not found');
    }

    return getDashboardData(user, query);
  } catch (error) {
    throw new Error(`Error getting watch history: ${error}`);
  }
}
