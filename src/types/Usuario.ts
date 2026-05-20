export interface Usuario {
  _id: string
  email: string
  name: string
  role: 'admin' | 'owner'
  negocioId?: string
  createdAt: Date
  updatedAt: Date
}

export type RegisterInput = {
  email: string
  password: string
  name: string
}

export type LoginInput = {
  email: string
  password: string
}

export type AuthResponse = {
  user: Omit<Usuario, 'createdAt' | 'updatedAt'>
  accessToken: string
}
