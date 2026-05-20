"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListNegociosUseCase = void 0;
class ListNegociosUseCase {
    negocioRepo;
    constructor(negocioRepo) {
        this.negocioRepo = negocioRepo;
    }
    async execute(filter) {
        const limit = Math.min(filter.limit ?? 20, 100);
        const page = Math.max(filter.page ?? 1, 1);
        return this.negocioRepo.list({ ...filter, limit, page });
    }
}
exports.ListNegociosUseCase = ListNegociosUseCase;
