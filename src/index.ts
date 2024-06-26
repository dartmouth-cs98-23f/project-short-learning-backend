import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './routes/user_routes'
import userAffinityRoutes from './routes/user_affinity_routes'
import relationshipRoutes from './routes/relationship_routes'
import videoRouter from './routes/video_routes'
import videoAffinityRouter from './routes/video_affinity_routes'
import recommendationRouter from './routes/recommendation_routes'
import mongoose from 'mongoose'
import { logger, requestLogger, responseLogger } from './services/logger'
import topicRouter from './routes/topics_routes'
import watchHistoryRouter from './routes/watch_history_routes'
import dashboardRouter from './routes/dashboard_routes'
import exploreRouter from './routes/explore_routes'
import vectorizedRecRouter from './routes/vectorized_recommendations_routes'

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
    const mongoURI = process.env.MONGODB_URI
    await mongoose.connect(mongoURI)
    await app.listen(port)
    console.log(`Server listening at http://localhost:${port}`)
  } catch (err) {
    logger.error(err)
    console.error(err)
  }
}

app.use('/api', userRoutes)
app.use('/api', userAffinityRoutes)
app.use('/api', relationshipRoutes)
app.use('/api', videoRouter)
app.use('/api', videoAffinityRouter)
app.use('/api', watchHistoryRouter)
app.use('/api', recommendationRouter)
app.use('/api', topicRouter)
app.use('/api', dashboardRouter)
app.use('/api', exploreRouter)
app.use('/api', vectorizedRecRouter)

runApp()
