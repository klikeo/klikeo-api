import { UsuarioDomain } from '../../domain/Usuario'

export interface CreateUsuarioData {
  email: string
  name: string
  passwordHash: string
  role?: 'admin' | 'owner'
}

export interface IUsuarioRepository {
  findByEmail(email: string): Promise<UsuarioDomain | null>
  findById(id: string): Promise<UsuarioDomain | null>
  create(data: CreateUsuarioData): Promise<UsuarioDomain>
  updateRefreshToken(id: string, hashedToken: string | null): Promise<void>
  findByRefreshToken(hashedToken: string): Promise<UsuarioDomain | null>
  list(page?: number, limit?: number, search?: string): Promise<{ data: UsuarioDomain[]; total: number }>
  update(id: string, data: { name?: string; role?: string }): Promise<UsuarioDomain | null>
  delete(id: string): Promise<boolean>
}
