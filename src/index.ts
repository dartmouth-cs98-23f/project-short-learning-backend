import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRoutes from './router'
import { videoRouter } from './routes/video_routes'
import mongoose from 'mongoose'
import { logger, requestLogger, responseLogger } from './services/logger'
import { recommendationRouter } from './routes/recommendation_routes'

const app = express()
const port: Number = 3000

dotenv.config()

// enable/disable cross origin resource sharing if necessary
app.use(cors())
app.options('*', cors())

app.use(express.json())
app.use(requestLogger)
app.use(responseLogger)

async function runApp() {
  try {
    const mongoURI =
      process.env.MONGODB_URI
    await mongoose.connect(mongoURI)
    await app.listen(port)
    console.log(`Server listening at http://localhost:${port}`)
  } catch (err) {
    logger.error(err)
    console.error(err)
  }
}

app.use('/api', apiRoutes)
app.use('/videos', videoRouter)
app.use('/recommendations', recommendationRouter)

runApp()
