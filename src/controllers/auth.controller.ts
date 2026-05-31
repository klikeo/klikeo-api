import { Request, Response } from "express"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import { RegisterUseCase } from "../use-cases/auth/RegisterUseCase"
import { LoginUseCase } from "../use-cases/auth/LoginUseCase"
import { UsuarioRepository } from "../repositories/UsuarioRepository"

const usuarioRepo = new UsuarioRepository()
const registerUseCase = new RegisterUseCase(usuarioRepo)
const loginUseCase = new LoginUseCase(usuarioRepo)

function getCookieOpts() {
  // prefer explicit env var; fall back to production domain only when not empty
  const rawDomain = process.env.COOKIE_DOMAIN?.trim()
  const domain = rawDomain && rawDomain.length > 0 ? rawDomain : undefined
  const secure = process.env.NODE_ENV === 'production'
  const sameSite = secure ? ("none" as const) : ("lax" as const)

  const opts: Record<string, any> = {
    httpOnly: true,
    secure:secure,
    sameSite:sameSite,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }

  if (domain) {
    // basic validation: must not contain spaces or protocol
    if (/^[A-Za-z0-9.-]+$/.test(domain)) {
      opts.domain = domain
    }
  }

  return opts
}

export const registerController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await registerUseCase.execute(req.body)
    res.status(201).json({ user })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "EMAIL_EXISTS") {
        res.status(409).json({ error: "El email ya está registrado" })
        return
      }
      res.status(400).json({ error: err.message })
      return
    }
    res.status(500).json({ error: "Error interno" })
  }
}

export const loginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await loginUseCase.execute(req.body)
    const COOKIE_OPTS = getCookieOpts()

    // Clear potential leftover cookies set with different domain variants
    try {
      // common domain variants that may have been used previously
      res.clearCookie('refreshToken', { path: '/', domain: 'klikeo.pro' })
      res.clearCookie('refreshToken', { path: '/', domain: '.klikeo.pro' })
      res.clearCookie('refreshToken', { path: '/', domain: 'api.klikeo.pro' })
      // host-only cookie (no domain)
      res.clearCookie('refreshToken', { path: '/' })
    } catch (err) {
      // non-fatal, log for diagnostics
      console.warn('Failed clearing old refresh cookies', err)
    }

    try {
      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS)
    } catch (err) {
      // preserve previous behavior but give more debug info in logs
      console.error('Failed setting refresh cookie, opts=', COOKIE_OPTS, 'err=', err)
      throw err
    }

    res.json({ user: result.user, accessToken: result.accessToken })
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
      res.status(401).json({ error: "Credenciales inválidas" })
      return
    }
    res.status(500).json({ message: "Error interno", error: err instanceof Error ? err.message : "Unknown error" })
  }
}

export const refreshController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const rawToken = req.cookies?.refreshToken
  if (!rawToken) {
    res.status(401).json({ error: "No hay refresh token" })
    return
  }

  const jwtSecret = process.env.JWT_SECRET
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET
  if (!jwtSecret || !jwtRefreshSecret) {
    res.status(500).json({ error: "Server misconfigured" })
    return
  }

  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex")
    const usuario = await usuarioRepo.findByRefreshToken(hashedToken)
    if (!usuario) {
      res.status(401).json({ error: "Refresh token inválido" })
      return
    }

    const accessToken = jwt.sign(
      { userId: usuario.id, role: usuario.role },
      jwtSecret,
      { expiresIn: "15m" },
    )
    // Rotate refresh token: issue a new one and store hashed version
    const newRefreshRaw = crypto.randomBytes(64).toString('hex')
    const newHashed = crypto.createHash('sha256').update(newRefreshRaw).digest('hex')
    await usuarioRepo.updateRefreshToken(usuario.id, newHashed)

    const COOKIE_OPTS = getCookieOpts()
    try {
      // Clear common variants before setting new cookie
      res.clearCookie('refreshToken', { path: '/', domain: 'klikeo.pro' })
      res.clearCookie('refreshToken', { path: '/', domain: '.klikeo.pro' })
      res.clearCookie('refreshToken', { path: '/', domain: 'api.klikeo.pro' })
      res.clearCookie('refreshToken', { path: '/' })
    } catch (err) {
      console.warn('Failed clearing old refresh cookies during rotate', err)
    }

    try {
      res.cookie('refreshToken', newRefreshRaw, COOKIE_OPTS)
    } catch (err) {
      console.error('Failed setting rotated refresh cookie', err)
    }

    res.json({ accessToken })
  } catch {
    res.status(401).json({ error: "Refresh token inválido" })
  }
}

export const logoutController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (req.user) {
      await usuarioRepo.updateRefreshToken(req.user.userId, null)
    }
    // clear with several common variants to remove any leftover cookies
    const COOKIE_OPTS = getCookieOpts()
    try {
      res.clearCookie('refreshToken', COOKIE_OPTS)
      res.clearCookie('refreshToken', { path: '/', domain: 'klikeo.pro' })
      res.clearCookie('refreshToken', { path: '/', domain: '.klikeo.pro' })
      res.clearCookie('refreshToken', { path: '/', domain: 'api.klikeo.pro' })
      res.clearCookie('refreshToken', { path: '/' })
    } catch (err) {
      console.warn('Failed clearing multiple cookie variants during logout', err)
    }
    res.json({ message: "Sesión cerrada" })
  } catch {
    res.status(500).json({ error: "Error interno" })
  }
}
