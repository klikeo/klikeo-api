import bcrypt from 'bcryptjs'
import { IUsuarioRepository } from '../../repositories/interfaces/IUsuarioRepository'

export interface RegisterInput {
  email: string
  password: string
  name: string
}

export interface RegisterOutput {
  id: string
  email: string
  name: string
  role: 'admin' | 'owner'
}

export class RegisterUseCase {
  constructor(private readonly usuarioRepo: IUsuarioRepository) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const { email, password, name } = input

    if (!email || !password || !name) {
      throw new Error('Todos los campos son requeridos')
    }
    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres')
    }

    const existing = await this.usuarioRepo.findByEmail(email.toLowerCase())
    if (existing) {
      throw new Error('EMAIL_EXISTS')
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const usuario = await this.usuarioRepo.create({
      email: email.toLowerCase(),
      name,
      passwordHash,
    })

    return {
      id: usuario.id,
      email: usuario.email,
      name: usuario.name,
      role: usuario.role,
    }
  }
}
