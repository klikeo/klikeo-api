import { Request, Response, NextFunction } from 'express'

export function authorize(...roles: ('admin' | 'owner')[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autorizado' })
      return
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Prohibido' })
      return
    }
    next()
  }
}
