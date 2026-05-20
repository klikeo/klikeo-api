import { INegocioRepository, ListNegociosFilter, ListNegociosResult } from '@/repositories/interfaces/INegocioRepository'

export class ListNegociosUseCase {
  constructor(private readonly negocioRepo: INegocioRepository) {}

  async execute(filter: ListNegociosFilter): Promise<ListNegociosResult> {
    const limit = Math.min(filter.limit ?? 20, 100)
    const page = Math.max(filter.page ?? 1, 1)
    return this.negocioRepo.list({ ...filter, limit, page })
  }
}
