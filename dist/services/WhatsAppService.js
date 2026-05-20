"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const WHATSAPP_API_URL = 'https://graph.facebook.com/v20.0';
class WhatsAppService {
    // Read env vars lazily so tests can set them in beforeAll
    get token() { return process.env.WHATSAPP_TOKEN ?? ''; }
    get phoneId() { return process.env.WHATSAPP_PHONE_ID ?? ''; }
    get verifyToken() { return process.env.WHATSAPP_VERIFY_TOKEN ?? ''; }
    get appSecret() { return process.env.WHATSAPP_APP_SECRET ?? ''; }
    verifyWebhookSignature(payload, signature) {
        const secret = this.appSecret;
        if (!secret)
            return false;
        const expected = crypto_1.default
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        const received = signature.replace('sha256=', '');
        try {
            return crypto_1.default.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
        }
        catch {
            return false;
        }
    }
    verifyChallenge(mode, token) {
        return mode === 'subscribe' && token === this.verifyToken;
    }
    async sendMessage(to, body) {
        if (!this.token || !this.phoneId) {
            throw new Error('WhatsApp credentials not configured');
        }
        // Ensure phone number has + prefix
        const formattedTo = to.startsWith('+') ? to : `+${to}`;
        console.log(`[WhatsApp] Sending to: ${formattedTo}`);
        try {
            const response = await axios_1.default.post(`${WHATSAPP_API_URL}/${this.phoneId}/messages`, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: formattedTo,
                type: 'text',
                text: { body },
            }, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(`[WhatsApp] Message sent successfully!`, response.data);
        }
        catch (error) {
            const err = error;
            const errorMsg = err.response?.data?.error?.message || 'Unknown error';
            console.error(`[WhatsApp] Failed to send:`, errorMsg);
            throw new Error(`WhatsApp API error: ${errorMsg}`);
        }
    }
    extractMessages(payload) {
        const messages = [];
        for (const entry of payload.entry) {
            for (const change of entry.changes) {
                if (change.field !== 'messages')
                    continue;
                const { messages: msgs, metadata } = change.value;
                if (!msgs)
                    continue;
                for (const msg of msgs) {
                    if (msg.type === 'text') {
                        messages.push({
                            from: msg.from,
                            body: msg.text.body,
                            phoneNumberId: metadata.phone_number_id,
                        });
                    }
                }
            }
        }
        return messages;
    }
}
exports.WhatsAppService = WhatsAppService;
