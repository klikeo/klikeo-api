import { BUSINESS_CATEGORIES } from "../../constants/categories"
import {
  INegocioRepository,
  UpdateNegocioData,
} from "../../repositories/interfaces/INegocioRepository"
import { NegocioDomain } from "../../domain/Negocio"

export class UpdateNegocioUseCase {
  constructor(private readonly negocioRepo: INegocioRepository) {}

  async execute(
    id: string,
    data: UpdateNegocioData,
    requestingOwnerId: string,
  ): Promise<NegocioDomain> {
    const negocio = await this.negocioRepo.findById(id)
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

    const updated = await this.negocioRepo.update(id, data)
    return updated!
  }
}
