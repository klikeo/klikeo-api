import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import { connectDB } from './db'
import { registerRoutes } from './routes'

export function createApp() {
  const app = express()

  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000'
  console.log('[CORS] Origin configurado:', corsOrigin)

  // CORS: libre para debug
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://klikeo.pro')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200)
    }
    next()
  })

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

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
