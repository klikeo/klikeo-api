import { BUSINESS_CATEGORIES } from "../../constants/categories"
import {
  INegocioRepository,
  CreateNegocioData,
} from "../../repositories/interfaces/INegocioRepository"
import { NegocioDomain } from "../../domain/Negocio"
import { normalizeSlug } from "../../utils/slug"

export interface CreateNegocioInput {
  slug?: string
  name: string
  description?: string
  category: string
  address?: string
  city: string
  phone?: string
  whatsappNumber: string
  logoUrl?: string
}

export class CreateNegocioUseCase {
  constructor(private readonly negocioRepo: INegocioRepository) {}

  async execute(
    input: CreateNegocioInput,
    ownerId: string,
  ): Promise<NegocioDomain> {
    const { name, category, city, whatsappNumber } = input

    if (!name || name.length < 2) {
      throw new Error("El nombre debe tener al menos 2 caracteres")
    }
    if (!city) {
      throw new Error("La ciudad es requerida")
    }
    if (!whatsappNumber) {
      throw new Error("El número de WhatsApp es requerido")
    }
    if (
      !BUSINESS_CATEGORIES.includes(
        category as (typeof BUSINESS_CATEGORIES)[number],
      )
    ) {
      throw new Error("Categoría inválida")
    }

    const slug = normalizeSlug(input.slug ?? name)
    if (!slug) {
      throw new Error("Slug inválido")
    }

    const data: CreateNegocioData = { ...input, ownerId, slug }
    return this.negocioRepo.create(data)
  }
}
