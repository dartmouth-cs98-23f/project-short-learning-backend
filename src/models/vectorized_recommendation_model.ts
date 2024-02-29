import { TopicMetadataDocument } from "./topic_models"
import { VideoMetadataDocument } from "./video_models"

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface RankingVideoMetadata {
  videoId: string
  topics: string[]
  score?: number
}

export interface RankingTopicMetadata {
  topic: string
  score?: number[]
}


export interface VideoRecommendation {
  userId: string
  videos: RankingVideoMetadata[]
}

export interface TopicRecommendation {
  userId: string
  topics: TopicMetadataDocument[]
}
