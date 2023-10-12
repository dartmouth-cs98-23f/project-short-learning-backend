import express, { Request, Response } from 'express'
import cors from 'cors'

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
        await app.listen(port)
        console.log(`Server listening at http://localhost:${port}`)
    } catch (err) {
        console.error(err)
    } 
}

runApp()