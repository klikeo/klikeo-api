import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { IUsuarioRepository } from '@/repositories/interfaces/IUsuarioRepository'

export interface LoginInput {
  email: string
  password: string
}

export interface LoginOutput {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    role: 'admin' | 'owner'
  }
}

export class LoginUseCase {
  constructor(private readonly usuarioRepo: IUsuarioRepository) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const { email, password } = input

    const usuario = await this.usuarioRepo.findByEmail(email.toLowerCase())
    if (!usuario) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const valid = await bcrypt.compare(password, usuario.passwordHash)
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const jwtSecret = process.env.JWT_SECRET
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets not configured')
    }

    const accessToken = jwt.sign(
      { userId: usuario.id, role: usuario.role },
      jwtSecret,
      { expiresIn: '15m' }
    )

    const rawRefresh = crypto.randomBytes(64).toString('hex')
    const hashedRefresh = crypto.createHash('sha256').update(rawRefresh).digest('hex')
    await this.usuarioRepo.updateRefreshToken(usuario.id, hashedRefresh)

    return {
      accessToken,
      refreshToken: rawRefresh,
      user: {
        id: usuario.id,
        email: usuario.email,
        name: usuario.name,
        role: usuario.role,
      },
    }
  }
}
