export interface Negocio {
  _id: string
  slug?: string
  name: string
  description?: string
  category: string
  address?: string
  city?: string
  phone?: string
  whatsappNumber: string
  logoUrl?: string
  bannerUrl?: string
  ownerId: string
  trainingData?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type CreateNegocioInput = Omit<Negocio, '_id' | 'ownerId' | 'isActive' | 'createdAt' | 'updatedAt'>
export type UpdateNegocioInput = Partial<CreateNegocioInput>
