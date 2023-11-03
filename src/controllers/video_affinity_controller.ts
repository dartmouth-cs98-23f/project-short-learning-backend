import VideoAffinity from "../models/video_affinity_model";
import { VideoMetadata } from '../models/video_models'

// import the list of strings from src\utils\affinityTruthTable and make it a truth table for the affinity topics
const fs = require('fs');

const fileContent = fs.readFileSync('src/utils/affinityTruthTable', 'utf8');
const affinitiesTruthTable = fileContent.split('\r\n');

export const createVideoAffinity = async (videoId, { affinities }) => {
  try {
    const video = await VideoMetadata.findById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    const existingVideoAffinities = await VideoAffinity.findOne({ videoId: videoId });

    if (existingVideoAffinities) {
      throw new Error('Video affinity already exists');
    }

    const videoAffinity = new VideoAffinity({
      videoId: video._id,
      affinities: new Map(),
    });

    affinities.forEach(({ topic, subTopic, affinityValue }) => {
      if (!affinitiesTruthTable.includes(`${topic}/${subTopic}`)) {
        throw new Error(`Invalid topic/subtopic: ${topic}/${subTopic}`);
      }
      videoAffinity.affinities.set(`${topic}/${subTopic}`, affinityValue);
    });

    const savedVideoAffinity = await videoAffinity.save();
    return savedVideoAffinity;
  } catch (error) {
    throw new Error(`Create video affinity error: ${error}`);
  }
}

export const getVideoAffinities = async (videoId) => {
  try {
    const video = await VideoMetadata.findById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    const videoAffinity = await VideoAffinity.findOne({ videoId: videoId });
    return videoAffinity;
  } catch (error) {
    throw new Error(`Get video affinities error: ${error}`);
  }
}

export const updateVideoAffinities = async (videoId, { affinities }) => {
  try {
    const video = await VideoMetadata.findById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    const videoAffinity = await VideoAffinity.findOne({ videoId: videoId });

    if (!videoAffinity) {
      throw new Error('Video affinities does not exists');
    }

    // Can only edit affinity value after creation
    affinities.forEach(({ topic, subTopic, affinityValue }) => {
      if (!affinitiesTruthTable.includes(`${topic}/${subTopic}`)) {
        throw new Error(`Invalid topic/subtopic: ${topic}/${subTopic}`);
      }
      videoAffinity.affinities.set(`${topic}/${subTopic}`, affinityValue);
    });

    const savedVideoAffinity = await videoAffinity.save();
    return savedVideoAffinity;
  } catch (error) {
    throw new Error(`Update video affinities error: ${error}`);
  }
}

export const deleteVideoAffinities = async (videoId) => {
  try {
    const video = await VideoMetadata.findById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    const videoAffinity = await VideoAffinity.findOne({ videoId: videoId });

    if (!videoAffinity) {
      throw new Error('Video affinities does not exists');
    }

    await videoAffinity.deleteOne(videoId);
    return true;
  } catch (error) {
    throw new Error(`Delete video affinities error: ${error}`);
  }
}