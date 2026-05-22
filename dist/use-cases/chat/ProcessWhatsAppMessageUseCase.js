"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessWhatsAppMessageUseCase = void 0;
class ProcessWhatsAppMessageUseCase {
    negocioRepo;
    chatSessionRepo;
    deepSeekService;
    whatsAppService;
    constructor(negocioRepo, chatSessionRepo, deepSeekService, whatsAppService) {
        this.negocioRepo = negocioRepo;
        this.chatSessionRepo = chatSessionRepo;
        this.deepSeekService = deepSeekService;
        this.whatsAppService = whatsAppService;
    }
    async execute(input) {
        const { clientePhone, messageBody, phoneNumberId } = input;
        // 1. Find the negocio by the WhatsApp phone number ID
        const negocio = await this.negocioRepo.findByWhatsappPhoneId(phoneNumberId);
        if (!negocio) {
            console.warn(`[Chatbot] No negocio found for phoneNumberId: ${phoneNumberId}`);
            return;
        }
        // 2. Find or create the chat session
        const session = await this.chatSessionRepo.findOrCreate(negocio.id, clientePhone);
        // 3. Save the user's message to the session
        await this.chatSessionRepo.addMessage(session.id, {
            role: "user",
            content: messageBody,
        });
        // 4. Build the system prompt with training data
        const systemPrompt = negocio.trainingData
            ? `Eres el asistente virtual de ${negocio.name}. Responde únicamente usando la siguiente información del negocio: ${negocio.trainingData}. Si no sabes la respuesta, indica que no tienes esa información y sugiere contactar directamente al negocio. Sé amable, conciso y en español.`
            : `Eres el asistente virtual de ${negocio.name} en ${negocio.city}. Responde de manera amable y concisa en español. Si no tienes información específica, indica que el cliente contacte directamente al negocio.`;
        // 5. Build the message history for DeepSeek (last 10 messages to avoid token limit)
        const history = session.historial.slice(-10);
        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map((m) => ({ role: m.role, content: m.content })),
        ];
        // 6. Call DeepSeek
        const assistantReply = await this.deepSeekService.chat(messages);
        // 7. Save the assistant's response
        await this.chatSessionRepo.addMessage(session.id, {
            role: "assistant",
            content: assistantReply,
        });
        // 8. Send the response via WhatsApp
        await this.whatsAppService.sendMessage(clientePhone, assistantReply);
    }
}
exports.ProcessWhatsAppMessageUseCase = ProcessWhatsAppMessageUseCase;
