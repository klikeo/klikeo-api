import { INegocioRepository } from '../../repositories/interfaces/INegocioRepository'
import { NegocioDomain } from '../../domain/Negocio'

export class GetNegocioUseCase {
  constructor(private readonly negocioRepo: INegocioRepository) {}

  async execute(identifier: string): Promise<NegocioDomain> {
    const negocio = await this.negocioRepo.findByIdOrSlug(identifier)
    if (!negocio) {
      throw new Error('NEGOCIO_NOT_FOUND')
    }
    return negocio
  }
}
