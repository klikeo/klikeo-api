"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNegocioUseCase = void 0;
const categories_1 = require("../../constants/categories");
class UpdateNegocioUseCase {
    negocioRepo;
    constructor(negocioRepo) {
        this.negocioRepo = negocioRepo;
    }
    async execute(id, data, requestingOwnerId) {
        const negocio = await this.negocioRepo.findById(id);
        if (!negocio) {
            throw new Error("NEGOCIO_NOT_FOUND");
        }
        if (negocio.ownerId !== requestingOwnerId) {
            throw new Error("FORBIDDEN");
        }
        if (data.category &&
            !categories_1.BUSINESS_CATEGORIES.includes(data.category)) {
            throw new Error("Categoría inválida");
        }
        const updated = await this.negocioRepo.update(id, data);
        return updated;
    }
}
exports.UpdateNegocioUseCase = UpdateNegocioUseCase;
