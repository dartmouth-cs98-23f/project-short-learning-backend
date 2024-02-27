import WatchHistory from "../models/watch_history_models";
import UserModel from "../models/user_model";

export const getWatchHistories = async (user, queryParameters) => {
  try {
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

    // query limit
    const watchHistory = await WatchHistory.find(query, { _id: 0, __v: 0 }, { sort: { date: -1 }, limit: limit });

    return watchHistory;
  } catch (error) {
    throw new Error(`Error getting watch history: ${error}`);
  }
};


export const getWatchHistory = async (user, { videoId }) => {
  try {
    // Find the watch history for the specific user
    const watchHistory = await WatchHistory.findOne({ userId: user.id, videoId: videoId });

    if (!watchHistory) {
      throw new Error("Watch history not found");
    }
  
    return watchHistory;
  } catch (error) {
    throw new Error(`Error getting watch history: ${error}`);
  }
};


export const insertWatchHistory = async (user, { videoId }, { clipId, duration }) => {
  try {
    const watchHistory = await WatchHistory.findOne({ userId: user.id, videoId: videoId });

    if (watchHistory) {
      // Update the date
      watchHistory.date = new Date();
      watchHistory.duration = duration;
      watchHistory.clipId = clipId;
      await watchHistory.save();
      return watchHistory;
    }

    const newWatchHistory = new WatchHistory({
      userId: user.id,
      date: new Date(),
      videoId: videoId,
      duration: duration,
      clipId: clipId,
    });

    await newWatchHistory.save();
    return newWatchHistory;

  } catch (error) {
    throw new Error(`Error inserting watch history: ${error}`);
  }
};

export const removeWatchHistory = async (user, { videoId }) => {
  try {
    const watchHistory = await WatchHistory.findOne({ userId: user.id, videoId: videoId });

    if (!watchHistory) {
      throw new Error("Watch history does not exist");
    }

    await watchHistory.deleteOne({ _id: watchHistory._id });

    return true;

  } catch (error) {
    throw new Error(`Error removing watch history: ${error}`);
  }
};

export const removeAllWatchHistory = async (user) => {
  try {
    const watchHistory = await WatchHistory.find({ userId: user.id });

    if (!watchHistory) {
      throw new Error("Watch history does not exist");
    }

    await WatchHistory.deleteMany({ userId: user.id });

    return true;

  } catch (error) {
    throw new Error(`Error removing all watch history: ${error}`);
  }
};

export const adminGetWatchHistories = async ({ userId }, query) => {
  try {
    const user = await UserModel.findById(userId);

    if(!user) {
      throw new Error('User not found');
    }

    return getWatchHistories(user, query);
  } catch (error) {
    throw new Error(`Error getting watch history: ${error}`);
  }
};