import mongoose, { Schema, Document } from 'mongoose'
import { NegocioDomain } from '../domain/Negocio'
import { INegocioRepository, CreateNegocioData, UpdateNegocioData, ListNegociosFilter, ListNegociosResult } from './interfaces/INegocioRepository'

interface NegocioDoc extends Document {
  slug?: string
  name: string
  description?: string
  category: string
  address?: string
  city: string
  phone?: string
  whatsappNumber: string
  whatsappPhoneId?: string
  logoUrl?: string
  ownerId: mongoose.Types.ObjectId
  trainingData?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const NegocioSchema = new Schema<NegocioDoc>(
  {
    slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    name: { type: String, required: true, minlength: 2 },
    description: { type: String, maxlength: 500 },
    category: { type: String, required: true },
    address: String,
    city: { type: String, required: true },
    phone: String,
    whatsappNumber: { type: String, required: true },
    whatsappPhoneId: { type: String },
    logoUrl: String,
    ownerId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    trainingData: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Text index for search
NegocioSchema.index({ name: 'text', description: 'text', city: 'text' })

export const NegocioModel =
  (mongoose.models.Negocio as mongoose.Model<NegocioDoc>) ||
  mongoose.model<NegocioDoc>('Negocio', NegocioSchema)

function toNegocioDomain(doc: NegocioDoc): NegocioDomain {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
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
  }
}

export class NegocioRepository implements INegocioRepository {
  async findById(id: string): Promise<NegocioDomain | null> {
    const doc = await NegocioModel.findById(id)
    return doc ? toNegocioDomain(doc) : null
  }

  async findBySlug(slug: string): Promise<NegocioDomain | null> {
    const doc = await NegocioModel.findOne({ slug })
    return doc ? toNegocioDomain(doc) : null
  }

  async findByIdOrSlug(identifier: string): Promise<NegocioDomain | null> {
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      const doc = await NegocioModel.findById(identifier)
      if (doc) {
        return toNegocioDomain(doc)
      }
    }

    const doc = await NegocioModel.findOne({ slug: identifier })
    return doc ? toNegocioDomain(doc) : null
  }

  async findByOwnerId(ownerId: string): Promise<NegocioDomain | null> {
    const doc = await NegocioModel.findOne({ ownerId })
    return doc ? toNegocioDomain(doc) : null
  }

  async findByWhatsappPhoneId(phoneNumberId: string): Promise<NegocioDomain | null> {
    const doc = await NegocioModel.findOne({ whatsappPhoneId: phoneNumberId })
    return doc ? toNegocioDomain(doc) : null
  }

  async create(data: CreateNegocioData): Promise<NegocioDomain> {
    try {
      const doc = await NegocioModel.create(data)
      return toNegocioDomain(doc)
    } catch (err: any) {
      if (
        err.code === 11000 &&
        (err.keyPattern?.slug || err.keyValue?.slug)
      ) {
        throw new Error('SLUG_ALREADY_EXISTS')
      }
      throw err
    }
  }

  async update(id: string, data: UpdateNegocioData): Promise<NegocioDomain | null> {
    try {
      const doc = await NegocioModel.findByIdAndUpdate(id, data, { new: true })
      return doc ? toNegocioDomain(doc) : null
    } catch (err: any) {
      if (
        err.code === 11000 &&
        (err.keyPattern?.slug || err.keyValue?.slug)
      ) {
        throw new Error('SLUG_ALREADY_EXISTS')
      }
      throw err
    }
  }

  async list(filter: ListNegociosFilter): Promise<ListNegociosResult> {
    const { search, city, category, page = 1, limit = 20 } = filter
    const query: Record<string, unknown> = { isActive: true }

    if (city) query.city = new RegExp(city, 'i')
    if (category) query.category = category
    if (search) query.$text = { $search: search }

    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      NegocioModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      NegocioModel.countDocuments(query),
    ])

    return {
      data: data.map(toNegocioDomain),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }
}
