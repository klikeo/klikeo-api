export interface NegocioDomain {
  id: string
  slug?: string
  name: string
  description?: string
  category: string
  address?: string
  city: string
  phone?: string
  whatsappNumber: string
  whatsappPhoneId?: string
  logoUrl?: string
  bannerUrl?: string
  ownerId: string
  trainingData?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
