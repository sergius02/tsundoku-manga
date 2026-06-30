import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import compression from 'compression'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import mangasRouter from './routes/mangas.js'
import searchRouter from './routes/search.js'
import configRouter from './routes/config.js'
import backupRouter from './routes/backup.js'
import authRouter, { authMiddleware } from './routes/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(compression())
app.use(cors())
app.use(express.json({ limit: '10kb' }))

app.use('/api/auth', authRouter)

app.use('/api/mangas', authMiddleware, mangasRouter)
app.use('/api/search', authMiddleware, searchRouter)
app.use('/api/config', authMiddleware, configRouter)
app.use('/api/backup', authMiddleware, backupRouter)

app.use(express.static(join(__dirname, '../public')))

app.use(
  express.static(join(__dirname, '../dist'), {
    maxAge: '1d',
    etag: true,
  })
)

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.warn(`Server running on http://0.0.0.0:${PORT}`)
})
