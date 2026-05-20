import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthPayload {
  userId: string
  role: 'admin' | 'owner'
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado' })
    return
  }

  const token = authHeader.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) {
    res.status(500).json({ error: 'Server misconfigured' })
    return
  }

  try {
    const payload = jwt.verify(token, secret) as AuthPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
