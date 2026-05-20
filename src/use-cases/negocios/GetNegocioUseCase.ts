import { INegocioRepository } from '@/repositories/interfaces/INegocioRepository'
import { NegocioDomain } from '@/domain/Negocio'

export class GetNegocioUseCase {
  constructor(private readonly negocioRepo: INegocioRepository) {}

  async execute(id: string): Promise<NegocioDomain> {
    const negocio = await this.negocioRepo.findById(id)
    if (!negocio) {
      throw new Error('NEGOCIO_NOT_FOUND')
    }
    return negocio
  }
}
