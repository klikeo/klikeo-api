import { INegocioRepository } from '../../repositories/interfaces/INegocioRepository'
import { NegocioDomain } from '../../domain/Negocio'

export class GetNegocioByOwnerUseCase {
  constructor(private readonly negocioRepo: INegocioRepository) {}

  async execute(ownerId: string): Promise<NegocioDomain> {
    const negocio = await this.negocioRepo.findByOwnerId(ownerId)
    if (!negocio) {
      throw new Error('NEGOCIO_NOT_FOUND')
    }
    return negocio
  }
}
