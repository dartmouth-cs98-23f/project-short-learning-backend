import express from 'express'
import cors from 'cors'
import apiRoutes from './router'
import mongoose from 'mongoose'
import { logger, requestLogger, responseLogger } from './services/logger'

const app = express()
const port: Number = 3000

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

runApp()
