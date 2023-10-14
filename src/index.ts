import express, { Request, Response } from 'express'
import cors from 'cors'
import apiRoutes from './router';
import mongoose from 'mongoose';

require('dotenv').config();

const app = express()
const port: Number = 3000

// enable/disable cross origin resource sharing if necessary
app.use(cors())
app.options('*', cors())

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!')
})

async function runApp() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/short-form-api';
        await mongoose.connect(mongoURI);
        await app.listen(port)
        console.log(`Server listening at http://localhost:${port}`)
    } catch (err) {
        console.error(err)
    } 
}

app.use('/api', apiRoutes)

runApp()