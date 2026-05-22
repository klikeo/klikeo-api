import "dotenv/config"
import express from "express"
import cookieParser from "cookie-parser"
import { connectDB } from "./db"
// import { registerRoutes } from "./routes"
import authRouter from "../routes/auth.routes"
import bussinesRouter from "../routes/negocios.routes"
import cors from "cors"

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

  // registerRoutes(app)

  app.use("/api/auth", authRouter)
  app.use("/api/negocios", bussinesRouter)
  // app.use('/api/webhooks', webhooksRouter)
  // app.use('/api/admin', adminRouter)

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
  await connectDB()
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
