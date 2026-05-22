"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainChatbotUseCase = void 0;
class TrainChatbotUseCase {
    negocioRepo;
    constructor(negocioRepo) {
        this.negocioRepo = negocioRepo;
    }
    async execute(negocioId, trainingData, requestingOwnerId) {
        const negocio = await this.negocioRepo.findById(negocioId);
        if (!negocio)
            throw new Error('NEGOCIO_NOT_FOUND');
        if (negocio.ownerId !== requestingOwnerId)
            throw new Error('FORBIDDEN');
        if (!trainingData.trim())
            throw new Error('Training data no puede estar vacío');
        await this.negocioRepo.update(negocioId, { trainingData });
    }
}
exports.TrainChatbotUseCase = TrainChatbotUseCase;
