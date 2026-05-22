import "dotenv/config"
import express from "express"
import cookieParser from "cookie-parser"
import { connectDB } from "./infra/db"
import { registerRoutes } from "./infra/routes"
import cors from 'cors';

export function createApp() {
  const app = express()

  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000"
  console.log("[CORS] Origin configurado:", corsOrigin)

  // CORS: usar dominio exacto para cookies/credentials
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
      ],
    }),
  )

  app.use(express.json())
  app.use(cookieParser())

  registerRoutes(app)

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
  })

  return app
}

async function main() {
  const app = createApp()
  const PORT = process.env.PORT ?? 3001
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`)
  })
  // await connectDB()
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
