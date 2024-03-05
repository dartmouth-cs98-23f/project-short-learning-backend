import mongoose from 'mongoose'
import { VideoMetadataDocument } from '../models/video_models'
import { logger } from '../services/logger'
import { ClipMetadataDocument } from '../models/clip_models'

export interface ReducedVideoMetadataPayload {
  _id: mongoose.Types.ObjectId
  title: string
  description: string
  clips: ClipMetadataDocument[] | mongoose.Types.ObjectId[] | ReducedClipMetadataPayload[]
  thumbnailURL: string
}

export interface ReducedClipMetadataPayload {
  _id: mongoose.Types.ObjectId
  duration: number // Seconds
  clipURL: string // Link to CDN Manifest
}

export const reduceVideo = (
  video: VideoMetadataDocument
): ReducedVideoMetadataPayload => {
  const reducedVideo: ReducedVideoMetadataPayload = {
    _id: video._id,
    title: video.title,
    description: video.description,
    clips: video.clips.map((clip) => {
      return reduceClip(clip as any as ClipMetadataDocument)
    }),
    thumbnailURL: video.thumbnailURL,
  }
  return reducedVideo
}

export const reduceClip = (
  clip: ClipMetadataDocument
): ReducedClipMetadataPayload => {
  const reducedClip: ReducedClipMetadataPayload = {
    _id: clip._id,
    duration: clip.duration,
    clipURL: clip.clipURL
  }
  return reducedClip
}
