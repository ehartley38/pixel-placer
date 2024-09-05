import express from 'express'
import cors from "cors"
import mainRouter from './controllers/main.js'
import { corsOptions } from './utils/corsOptions.js'

const app = express()

app.use(cors(corsOptions))

app.use("/api/", mainRouter)

export default app