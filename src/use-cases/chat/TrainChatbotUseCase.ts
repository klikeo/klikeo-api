import { INegocioRepository } from '../../repositories/interfaces/INegocioRepository'

export class TrainChatbotUseCase {
  constructor(private readonly negocioRepo: INegocioRepository) {}

  async execute(negocioId: string, trainingData: string, requestingOwnerId: string): Promise<void> {
    const negocio = await this.negocioRepo.findById(negocioId)
    if (!negocio) throw new Error('NEGOCIO_NOT_FOUND')
    if (negocio.ownerId !== requestingOwnerId) throw new Error('FORBIDDEN')
    if (!trainingData.trim()) throw new Error('Training data no puede estar vacío')
    await this.negocioRepo.update(negocioId, { trainingData })
  }
}
