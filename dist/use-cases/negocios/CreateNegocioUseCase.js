"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNegocioUseCase = void 0;
const categories_1 = require("../../constants/categories");
class CreateNegocioUseCase {
    negocioRepo;
    constructor(negocioRepo) {
        this.negocioRepo = negocioRepo;
    }
    async execute(input, ownerId) {
        const { name, category, city, whatsappNumber } = input;
        if (!name || name.length < 2) {
            throw new Error("El nombre debe tener al menos 2 caracteres");
        }
        if (!city) {
            throw new Error("La ciudad es requerida");
        }
        if (!whatsappNumber) {
            throw new Error("El número de WhatsApp es requerido");
        }
        if (!categories_1.BUSINESS_CATEGORIES.includes(category)) {
            throw new Error("Categoría inválida");
        }
        const data = { ...input, ownerId };
        return this.negocioRepo.create(data);
    }
}
exports.CreateNegocioUseCase = CreateNegocioUseCase;
