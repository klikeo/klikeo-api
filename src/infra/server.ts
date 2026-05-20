import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDB } from './db'
import { registerRoutes } from './routes'

export function createApp() {
  const app = express()

  app.options('*', cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true
  }))

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000', credentials: true }))
  app.use(express.json())
  app.use(cookieParser())

  registerRoutes(app)

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  return app
}

async function main() {
  await connectDB()
  const app = createApp()
  const PORT = process.env.PORT ?? 3001
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`)
  })
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
}
