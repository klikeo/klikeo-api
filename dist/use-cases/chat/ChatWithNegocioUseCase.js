"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatWithNegocioUseCase = void 0;
class ChatWithNegocioUseCase {
    negocioRepo;
    deepSeekService;
    constructor(negocioRepo, deepSeekService) {
        this.negocioRepo = negocioRepo;
        this.deepSeekService = deepSeekService;
    }
    async execute(negocioId, conversation) {
        const negocio = await this.negocioRepo.findById(negocioId);
        if (!negocio) {
            throw new Error('NEGOCIO_NOT_FOUND');
        }
        const systemPrompt = negocio.trainingData
            ? `Eres el asistente virtual de ${negocio.name}. Responde únicamente usando la siguiente información del negocio: ${negocio.trainingData}. Si no sabes la respuesta, indica que no tienes esa información y sugiere contactar directamente al negocio. Sé amable, conciso y en español.`
            : `Eres el asistente virtual de ${negocio.name} en ${negocio.city}. Responde de manera amable y concisa en español. Si no tienes información específica, indica que el cliente contacte directamente al negocio.`;
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversation.map((message) => ({ role: message.role, content: message.content })),
        ];
        return this.deepSeekService.chat(messages);
    }
}
exports.ChatWithNegocioUseCase = ChatWithNegocioUseCase;
