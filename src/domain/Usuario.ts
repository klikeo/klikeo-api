export interface UsuarioDomain {
  id: string
  email: string
  name: string
  role: 'admin' | 'owner'
  negocioId?: string
  passwordHash: string
  refreshToken?: string
  createdAt: Date
  updatedAt: Date
}
