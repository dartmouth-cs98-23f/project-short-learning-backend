import WatchHistory from "../models/watch_history_models";

export const getWatchHistories = async (user) => {
  try {
    const watchHistory = await WatchHistory.find({ userId: user.id }, { _id: 0, __v: 0 }, { sort: { date: -1 } });
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


export const insertWatchHistory = async (user, { videoId }) => {
  try {
    const watchHistory = await WatchHistory.findOne({ userId: user.id, videoId: videoId });

    if (watchHistory) {
      // Update the date
      watchHistory.date = new Date();
      await watchHistory.save();
      return watchHistory;
    }

    const newWatchHistory = new WatchHistory({
      userId: user.id,
      date: new Date(),
      videoId: videoId,
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
