import WatchHistory from "../models/watch_history_models";

export const getWatchHistories = async (user) => {
  try {
    const watchHistory = await WatchHistory.find({ user: user.id });
    return watchHistory;
  } catch (error) {
    throw new Error(`Error getting watch history: ${error}`);
  }
};

export const getWatchHistory = async (user, { videoId }) => {
  try {
    // Find the watch history for the specific user
    const watchHistory = await WatchHistory.findOne({ userId: user.id });

    if (!watchHistory) {
      throw new Error("Watch history not found");
    }

    const history = watchHistory.history;

    const video = history.find((video) => String(video.videoId) === String(videoId));

    if (!video) {
      throw { id: videoId, date: null };
    }

    return video;
  } catch (error) {
    throw new Error(`Error getting watch history: ${error}`);
  }
};


export const createWatchHistory = async (user) => {
  try {
    const watchHistory = await WatchHistory.findOne({ user: user.id });

    if (!watchHistory) {
      const newWatchHistory = new WatchHistory({
        user: user.id,
        history: [],
      });

      await newWatchHistory.save();
      return newWatchHistory;
    }

    throw new Error("Watch history already exists, use PUT to update and insert new videos");
  } catch (error) {
    throw new Error(`Error creating watch history: ${error}`);
  }
};

export const insertWatchHistory = async (user, { videoId }) => {
  try {
    const watchHistory = await WatchHistory.findOne({ user: user.id });

    if (!watchHistory) {
      throw new Error("Watch history does not exist, use POST to create new watch history");
    }

    watchHistory.history.push({
      videoId,
      date: new Date(),
    });
    await watchHistory.save();
    return watchHistory;
  } catch (error) {
    throw new Error(`Error inserting watch history: ${error}`);
  }
};

export const removeWatchHistory = async (user, { videoId }) => {
  try {
    const watchHistory = await WatchHistory.findOne({ user: user.id });

    if (!watchHistory) {
      throw new Error("Watch history does not exist");
    }

    const history = watchHistory.history;

    const video = history.find((video) => video.videoId === videoId);

    if (!video) {
      throw new Error("Video not found in watch history");
    }

    const index = history.indexOf(video);
    history.splice(index, 1);

    await watchHistory.save();
    return watchHistory;
  } catch (error) {
    throw new Error(`Error removing watch history: ${error}`);
  }
};

export const removeAllWatchHistory = async (user) => {
  try {
    const watchHistory = await WatchHistory.findOne({ user: user.id });

    if (!watchHistory) {
      throw new Error("Watch history does not exist");
    }

    watchHistory.history = [];
    await watchHistory.save();
    return watchHistory;
  } catch (error) {
    throw new Error(`Error removing all watch history: ${error}`);
  }
};