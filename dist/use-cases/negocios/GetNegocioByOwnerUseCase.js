"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNegocioByOwnerUseCase = void 0;
class GetNegocioByOwnerUseCase {
    negocioRepo;
    constructor(negocioRepo) {
        this.negocioRepo = negocioRepo;
    }
    async execute(ownerId) {
        const negocio = await this.negocioRepo.findByOwnerId(ownerId);
        if (!negocio) {
            throw new Error('NEGOCIO_NOT_FOUND');
        }
        return negocio;
    }
}
exports.GetNegocioByOwnerUseCase = GetNegocioByOwnerUseCase;
