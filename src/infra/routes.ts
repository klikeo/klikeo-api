import { Express } from 'express'
// import authRouter from '@/controllers/auth.controller'
import negociosRouter from '@/controllers/negocios.controller'
import webhooksRouter from '@/controllers/webhooks.controller'
import adminRouter from '@/controllers/admin.controller'

export function registerRoutes(app: Express): void {
  // app.use('/api/auth', authRouter)
  app.use('/api/negocios', negociosRouter)
  app.use('/api/webhooks', webhooksRouter)
  app.use('/api/admin', adminRouter)
}
