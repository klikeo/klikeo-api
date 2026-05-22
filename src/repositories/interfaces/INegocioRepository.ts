import { NegocioDomain } from '../../domain/Negocio'

export interface CreateNegocioData {
  name: string
  description?: string
  category: string
  address?: string
  city: string
  phone?: string
  whatsappNumber: string
  logoUrl?: string
  ownerId: string
  trainingData?: string
}

export interface UpdateNegocioData {
  name?: string
  description?: string
  category?: string
  address?: string
  city?: string
  phone?: string
  whatsappNumber?: string
  whatsappPhoneId?: string
  logoUrl?: string
  trainingData?: string
}

export interface ListNegociosFilter {
  search?: string
  city?: string
  category?: string
  page?: number
  limit?: number
}

export interface ListNegociosResult {
  data: NegocioDomain[]
  total: number
  page: number
  totalPages: number
}

export interface INegocioRepository {
  findById(id: string): Promise<NegocioDomain | null>
  findByOwnerId(ownerId: string): Promise<NegocioDomain | null>
  findByWhatsappPhoneId(phoneNumberId: string): Promise<NegocioDomain | null>
  create(data: CreateNegocioData): Promise<NegocioDomain>
  update(id: string, data: UpdateNegocioData): Promise<NegocioDomain | null>
  list(filter: ListNegociosFilter): Promise<ListNegociosResult>
}
