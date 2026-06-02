import { BUSINESS_CATEGORIES } from "../../constants/categories"
import {
  INegocioRepository,
  UpdateNegocioData,
} from "../../repositories/interfaces/INegocioRepository"
import { NegocioDomain } from "../../domain/Negocio"
import { normalizeSlug } from "../../utils/slug"

export class UpdateNegocioUseCase {
  constructor(private readonly negocioRepo: INegocioRepository) {}

  async execute(
    identifier: string,
    data: UpdateNegocioData,
    requestingOwnerId: string,
  ): Promise<NegocioDomain> {
    if (data.slug !== undefined) {
      data.slug = normalizeSlug(data.slug)
      if (!data.slug) {
        throw new Error("Slug inválido")
      }
    }

    const negocio = await this.negocioRepo.findByIdOrSlug(identifier)
    if (!negocio) {
      throw new Error("NEGOCIO_NOT_FOUND")
    }
    if (negocio.ownerId !== requestingOwnerId) {
      throw new Error("FORBIDDEN")
    }
    if (
      data.category &&
      !BUSINESS_CATEGORIES.includes(
        data.category as (typeof BUSINESS_CATEGORIES)[number],
      )
    ) {
      throw new Error("Categoría inválida")
    }

    const updated = await this.negocioRepo.update(negocio.id, data)
    return updated!
  }
}
