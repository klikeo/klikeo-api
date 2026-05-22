"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incommingMessagesFromMetaController = exports.whatsappVerificationController = void 0;
const ChatSessionRepository_1 = require("@/repositories/ChatSessionRepository");
const NegocioRepository_1 = require("@/repositories/NegocioRepository");
const DeepSeekService_1 = require("@/services/DeepSeekService");
const WhatsAppService_1 = require("@/services/WhatsAppService");
const ProcessWhatsAppMessageUseCase_1 = require("@/use-cases/chat/ProcessWhatsAppMessageUseCase");
const whatsAppService = new WhatsAppService_1.WhatsAppService();
const deepSeekService = new DeepSeekService_1.DeepSeekService();
const negocioRepo = new NegocioRepository_1.NegocioRepository();
const chatSessionRepo = new ChatSessionRepository_1.ChatSessionRepository();
const processMessageUseCase = new ProcessWhatsAppMessageUseCase_1.ProcessWhatsAppMessageUseCase(negocioRepo, chatSessionRepo, deepSeekService, whatsAppService);
// GET /api/webhooks/whatsapp — Meta webhook verification challenge
const whatsappVerificationController = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (whatsAppService.verifyChallenge(mode, token)) {
        res.status(200).send(challenge);
        return;
    }
    res.status(403).json({ error: "Verificación fallida" });
};
exports.whatsappVerificationController = whatsappVerificationController;
// POST /api/webhooks/whatsapp — incoming messages from Meta
const incommingMessagesFromMetaController = (req, res) => {
    const signature = req.headers["x-hub-signature-256"];
    // Always respond 200 immediately — Meta requires fast ACK
    const rawBody = JSON.stringify(req.body);
    if (signature &&
        !whatsAppService.verifyWebhookSignature(rawBody, signature)) {
        console.warn("WhatsApp webhook: invalid signature");
    }
    res.sendStatus(200);
    // Async processing — do not block the request
    const payload = req.body;
    if (payload?.object !== "whatsapp_business_account")
        return;
    const messages = whatsAppService.extractMessages(payload);
    if (messages.length === 0)
        return;
    // Process each message with the UseCase
    for (const msg of messages) {
        processMessageUseCase
            .execute({
            clientePhone: msg.from,
            messageBody: msg.body,
            phoneNumberId: msg.phoneNumberId,
        })
            .catch((err) => {
            console.error(`[WhatsApp] Error processing message:`, err);
        });
    }
};
exports.incommingMessagesFromMetaController = incommingMessagesFromMetaController;
