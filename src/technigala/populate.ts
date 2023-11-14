import { ClipMetadata } from '../models/clip_models'
import { TopicMetadata, TopicMetadataDocument } from '../models/topic_models'
import { VideoMetadata } from '../models/video_models'
import { PopTopicsDocument, topicDocuments } from './data/topics'
import { createFile } from './utils'
import fs from 'fs'

const baseS3URL =
  'https://hlsstack-hlsbucketf901f2c8-1wlixklj3wkgx.s3.us-east-1.amazonaws.com'
// Read in topics from data/topics.json
export const populateTopics = async () => {
  try {
    var topicToVideos = new Map<string, string[]>()

    // maps ids to combinednames and vice versa
    const topicMap = new Map<string, string>()
    const topics: PopTopicsDocument[] = topicDocuments
    for (const topic of topics) {
      const metadata: TopicMetadataDocument = await TopicMetadata.create({
        topicName: topic.topicName,
        subTopicName: topic.subTopicName,
        thumbnailURL: topic.thumbnailurl,
        displayTopicName: topic.displaySubtopicName,
        displaySubtopicName: topic.displaySubtopicName,
        combinedTopicName: `${topic.topicName}/${topic.subTopicName}`
      })

      // add to map
      topicToVideos.set(topic.subTopicName, [])
      // remove 'new ObjectId(' and ')'
      const id = metadata._id.toString()
      topicMap.set(id, metadata.combinedTopicName)
      topicMap.set(metadata.combinedTopicName, id)
    }
    // createFile('oldTopic', topicMap)
    return [topicMap, topicToVideos]
  } catch (error) {
    console.log(error)
  }
}

export const populateVideos = async (topicMap: Map<string, string>, topicToVideos: Map<string, string>) => {
  try {
    // read all folders under /clips

    const folders: string[] = fs.readdirSync('./clips')

    for (var i = 0; i < folders.length; i++) {
      // for each folder, create a video metadata object
      if (!folders[i].startsWith('playlist_')) {
        continue
      }
      console.log(folders[i])
      // cut playlist_
      const folderName = folders[i]
      const cutPlaylist = folders[i].substring(9)

      // split off topic
      const preTopic = cutPlaylist.split('_')[0]
      const preSubTopic = cutPlaylist.split('_')[1]

      // break topic (eg.) HomeDesign -> home-design
      var topic = preTopic.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
      var subTopic = preSubTopic
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase()

      // create title, the third _ is the start of the title, from then on all _ are spaces
      const title = folderName
        .substring(folderName.indexOf('_', folderName.indexOf('_') + 1) + 1)
        .replace(/_/g, ' ')
      const duration = 0

      if (topic == 'arts&crafts') {
        topic = 'Arts and Crafts'
      }

      const topicId = topicMap.get(`${topic}/${subTopic}`)

      // lowercase, replace spaces with dashes
      const realTopicName = topic.replace(/ /g, '-').toLowerCase()
      const realSubTopicName = subTopic.replace(/ /g, '-').toLowerCase()
      const realTopicComibined = `${realTopicName}/${realSubTopicName}`

      const topicMetadata = await TopicMetadata.findOne({
        combinedTopicName: realTopicComibined
      })

      const thumbnailURL = topicMetadata.thumbnailURL
      
      const videoMetadata = await VideoMetadata.create({
        title: title,
        description:
          'This is a test video for Technigala! :) The topic is ' +
          topic +
          ' and the subtopic is ' +
          subTopic +
          '.',
        uploadDate: new Date(),
        uploader: '123456789100',
        duration: duration,
        thumbnailURL: thumbnailURL,
        topicId,
        clips: [],
        views: [],
        likes: [],
        dislikes: []
      })

      const a = topicToVideos.get(subTopic) as any
      a.push(videoMetadata._id.toString())

      const clipFolders = fs.readdirSync(`./clips/${folderName}`)
      const clips = []
      for (var j = 0; j < clipFolders.length; j++) {
        if (!clipFolders[j].startsWith('video_')) {
          continue
        }

        const manifest = clipFolders[j] + '_.m3u8'

        const clipUrl = `${baseS3URL}/technigala/clips/${folderName}/${clipFolders[j]}/${manifest}`

        const clipMetadata = await ClipMetadata.create({
          videoId: videoMetadata._id,
          title: `Part ${j + 1} of a video about ${topic} and ${subTopic}!`,
          description:
            'This is a test clip for Technigala! :) The topic is ' +
            topic +
            ' and the subtopic is ' +
            subTopic +
            '.',
          uploadDate: new Date(),
          uploader: '123456789100',
          duration: duration,
          thumbnailURL: thumbnailURL,
          clipURL: clipUrl,
          views: [],
          likes: [],
          dislikes: []
        })
        clips.push(clipMetadata._id)
      }
      videoMetadata.clips = clips
      await videoMetadata.save()

    }
    return topicToVideos as unknown as Map<string, string[]>
  } catch (error) {
    console.log(error)
  }
}
