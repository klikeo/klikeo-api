"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekService = void 0;
const axios_1 = __importDefault(require("axios"));
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';
class DeepSeekService {
    get apiKey() { return process.env.DEEPSEEK_API_KEY ?? ''; }
    async chat(messages) {
        const apiKey = this.apiKey;
        if (!apiKey) {
            throw new Error('DEEPSEEK_API_KEY not configured');
        }
        const response = await axios_1.default.post(`${DEEPSEEK_API_URL}/chat/completions`, {
            model: 'deepseek-chat',
            messages,
            max_tokens: 500,
            temperature: 0.7,
        }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.choices[0].message.content;
    }
}
exports.DeepSeekService = DeepSeekService;
