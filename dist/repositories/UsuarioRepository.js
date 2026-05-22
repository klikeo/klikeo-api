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
exports.UsuarioRepository = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UsuarioSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'owner'], default: 'owner' },
    negocioId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Negocio' },
    refreshToken: { type: String, select: false },
}, { timestamps: true });
const UsuarioModel = mongoose_1.default.model('Usuario', UsuarioSchema);
function toUsuarioDomain(doc) {
    return {
        id: doc._id.toString(),
        email: doc.email,
        name: doc.name,
        role: doc.role,
        negocioId: doc.negocioId?.toString(),
        passwordHash: doc.passwordHash,
        refreshToken: doc.refreshToken,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
class UsuarioRepository {
    async findByEmail(email) {
        const doc = await UsuarioModel.findOne({ email }).select('+passwordHash +refreshToken');
        return doc ? toUsuarioDomain(doc) : null;
    }
    async findById(id) {
        const doc = await UsuarioModel.findById(id).select('+passwordHash +refreshToken');
        return doc ? toUsuarioDomain(doc) : null;
    }
    async create(data) {
        const doc = await UsuarioModel.create({
            email: data.email,
            name: data.name,
            passwordHash: data.passwordHash,
            role: data.role ?? 'owner',
        });
        // Re-fetch with hidden fields to return complete domain object
        const withFields = await UsuarioModel.findById(doc._id).select('+passwordHash +refreshToken');
        return toUsuarioDomain(withFields);
    }
    async updateRefreshToken(id, hashedToken) {
        await UsuarioModel.findByIdAndUpdate(id, { refreshToken: hashedToken });
    }
    async findByRefreshToken(hashedToken) {
        const doc = await UsuarioModel.findOne({ refreshToken: hashedToken }).select('+passwordHash +refreshToken');
        return doc ? toUsuarioDomain(doc) : null;
    }
    async list(page = 1, limit = 20, search) {
        const skip = (page - 1) * limit;
        const query = {};
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
            ];
        }
        const [data, total] = await Promise.all([
            UsuarioModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-passwordHash -refreshToken'),
            UsuarioModel.countDocuments(query),
        ]);
        return { data: data.map(toUsuarioDomain), total };
    }
    async update(id, data) {
        const doc = await UsuarioModel.findByIdAndUpdate(id, { $set: data }, { new: true }).select('-passwordHash -refreshToken');
        return doc ? toUsuarioDomain(doc) : null;
    }
    async delete(id) {
        const result = await UsuarioModel.findByIdAndDelete(id);
        return !!result;
    }
}
exports.UsuarioRepository = UsuarioRepository;
