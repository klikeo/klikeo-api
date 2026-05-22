"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNegocioUseCase = void 0;
class GetNegocioUseCase {
    negocioRepo;
    constructor(negocioRepo) {
        this.negocioRepo = negocioRepo;
    }
    async execute(id) {
        const negocio = await this.negocioRepo.findById(id);
        if (!negocio) {
            throw new Error('NEGOCIO_NOT_FOUND');
        }
        return negocio;
    }
}
exports.GetNegocioUseCase = GetNegocioUseCase;
