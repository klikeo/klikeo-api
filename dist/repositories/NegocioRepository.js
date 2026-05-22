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
exports.NegocioRepository = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const NegocioSchema = new mongoose_1.Schema({
    name: { type: String, required: true, minlength: 2 },
    description: { type: String, maxlength: 500 },
    category: { type: String, required: true },
    address: String,
    city: { type: String, required: true },
    phone: String,
    whatsappNumber: { type: String, required: true },
    whatsappPhoneId: { type: String },
    logoUrl: String,
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    trainingData: String,
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
// Text index for search
NegocioSchema.index({ name: 'text', description: 'text', city: 'text' });
const NegocioModel = mongoose_1.default.model('Negocio', NegocioSchema);
function toNegocioDomain(doc) {
    return {
        id: doc._id.toString(),
        name: doc.name,
        description: doc.description,
        category: doc.category,
        address: doc.address,
        city: doc.city,
        phone: doc.phone,
        whatsappNumber: doc.whatsappNumber,
        whatsappPhoneId: doc.whatsappPhoneId,
        logoUrl: doc.logoUrl,
        ownerId: doc.ownerId.toString(),
        trainingData: doc.trainingData,
        isActive: doc.isActive,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
class NegocioRepository {
    async findById(id) {
        const doc = await NegocioModel.findById(id);
        return doc ? toNegocioDomain(doc) : null;
    }
    async findByOwnerId(ownerId) {
        const doc = await NegocioModel.findOne({ ownerId });
        return doc ? toNegocioDomain(doc) : null;
    }
    async findByWhatsappPhoneId(phoneNumberId) {
        const doc = await NegocioModel.findOne({ whatsappPhoneId: phoneNumberId });
        return doc ? toNegocioDomain(doc) : null;
    }
    async create(data) {
        const doc = await NegocioModel.create(data);
        return toNegocioDomain(doc);
    }
    async update(id, data) {
        const doc = await NegocioModel.findByIdAndUpdate(id, data, { new: true });
        return doc ? toNegocioDomain(doc) : null;
    }
    async list(filter) {
        const { search, city, category, page = 1, limit = 20 } = filter;
        const query = { isActive: true };
        if (city)
            query.city = new RegExp(city, 'i');
        if (category)
            query.category = category;
        if (search)
            query.$text = { $search: search };
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            NegocioModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
            NegocioModel.countDocuments(query),
        ]);
        return {
            data: data.map(toNegocioDomain),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
}
exports.NegocioRepository = NegocioRepository;
