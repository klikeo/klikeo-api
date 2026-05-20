import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { RegisterUseCase } from '@/use-cases/auth/RegisterUseCase'
import { LoginUseCase } from '@/use-cases/auth/LoginUseCase'
import { UsuarioRepository } from '@/repositories/UsuarioRepository'
import { authenticate } from '@/middlewares/authenticate'

const router = Router()
const usuarioRepo = new UsuarioRepository()
const registerUseCase = new RegisterUseCase(usuarioRepo)
const loginUseCase = new LoginUseCase(usuarioRepo)

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await registerUseCase.execute(req.body)
    res.status(201).json({ user })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'EMAIL_EXISTS') {
        res.status(409).json({ error: 'El email ya está registrado' })
        return
      }
      res.status(400).json({ error: err.message })
      return
    }
    res.status(500).json({ error: 'Error interno' })
  }
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await loginUseCase.execute(req.body)
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS)
    res.json({ user: result.user, accessToken: result.accessToken })
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Credenciales inválidas' })
      return
    }
    res.status(500).json({ error: 'Error interno' })
  }
})

router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const rawToken = req.cookies?.refreshToken
  if (!rawToken) {
    res.status(401).json({ error: 'No hay refresh token' })
    return
  }

  const jwtSecret = process.env.JWT_SECRET
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET
  if (!jwtSecret || !jwtRefreshSecret) {
    res.status(500).json({ error: 'Server misconfigured' })
    return
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
    const usuario = await usuarioRepo.findByRefreshToken(hashedToken)
    if (!usuario) {
      res.status(401).json({ error: 'Refresh token inválido' })
      return
    }

    const accessToken = jwt.sign(
      { userId: usuario.id, role: usuario.role },
      jwtSecret,
      { expiresIn: '15m' }
    )
    res.json({ accessToken })
  } catch {
    res.status(401).json({ error: 'Refresh token inválido' })
  }
})

router.post('/logout', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await usuarioRepo.updateRefreshToken(req.user.userId, null)
    }
    res.clearCookie('refreshToken')
    res.json({ message: 'Sesión cerrada' })
  } catch {
    res.status(500).json({ error: 'Error interno' })
  }
})

export default router
