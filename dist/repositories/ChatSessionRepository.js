"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSessionRepository = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MessageSchema = new mongoose_1.Schema({
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
}, { _id: false });
const ChatSessionSchema = new mongoose_1.Schema({
    negocioId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Negocio", required: true },
    clientePhone: { type: String, required: true },
    estado: { type: String, enum: ["active", "closed"], default: "active" },
    historial: [MessageSchema],
}, { timestamps: true });
const ChatSessionModel = mongoose_1.default.model("ChatSession", ChatSessionSchema);
function toChatSessionDomain(doc) {
    return {
        id: doc._id.toString(),
        negocioId: doc.negocioId.toString(),
        clientePhone: doc.clientePhone,
        estado: doc.estado,
        historial: doc.historial.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
        })),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
class ChatSessionRepository {
    async findById(id) {
        const doc = await ChatSessionModel.findById(id);
        return doc ? toChatSessionDomain(doc) : null;
    }
    async findByNegocioId(negocioId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            ChatSessionModel.find({ negocioId })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit),
            ChatSessionModel.countDocuments({ negocioId }),
        ]);
        return { data: data.map(toChatSessionDomain), total };
    }
    async findOrCreate(negocioId, clientePhone) {
        let doc = await ChatSessionModel.findOne({
            negocioId,
            clientePhone,
            estado: "active",
        });
        if (!doc) {
            doc = await ChatSessionModel.create({ negocioId, clientePhone });
        }
        return toChatSessionDomain(doc);
    }
    async addMessage(sessionId, message) {
        const doc = await ChatSessionModel.findByIdAndUpdate(sessionId, { $push: { historial: { ...message, timestamp: new Date() } } }, { new: true });
        if (!doc)
            throw new Error("ChatSession not found");
        return toChatSessionDomain(doc);
    }
    async countByNegocioId(negocioId, since) {
        const query = { negocioId };
        if (since)
            query.createdAt = { $gte: since };
        return ChatSessionModel.countDocuments(query);
    }
    async list(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            ChatSessionModel.find().sort({ updatedAt: -1 }).skip(skip).limit(limit),
            ChatSessionModel.countDocuments(),
        ]);
        return { data: data.map(toChatSessionDomain), total };
    }
}
exports.ChatSessionRepository = ChatSessionRepository;
