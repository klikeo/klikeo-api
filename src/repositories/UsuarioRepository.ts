import mongoose, { Schema, Document } from 'mongoose'
import { UsuarioDomain } from '@/domain/Usuario'
import { IUsuarioRepository, CreateUsuarioData } from './interfaces/IUsuarioRepository'

interface UsuarioDoc extends Document {
  email: string
  name: string
  passwordHash: string
  role: 'admin' | 'owner'
  negocioId?: mongoose.Types.ObjectId
  refreshToken?: string
  createdAt: Date
  updatedAt: Date
}

const UsuarioSchema = new Schema<UsuarioDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'owner'], default: 'owner' },
    negocioId: { type: Schema.Types.ObjectId, ref: 'Negocio' },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
)

const UsuarioModel = mongoose.model<UsuarioDoc>('Usuario', UsuarioSchema)

function toUsuarioDomain(doc: UsuarioDoc): UsuarioDomain {
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
  }
}

export class UsuarioRepository implements IUsuarioRepository {
  async findByEmail(email: string): Promise<UsuarioDomain | null> {
    const doc = await UsuarioModel.findOne({ email }).select('+passwordHash +refreshToken')
    return doc ? toUsuarioDomain(doc) : null
  }

  async findById(id: string): Promise<UsuarioDomain | null> {
    const doc = await UsuarioModel.findById(id).select('+passwordHash +refreshToken')
    return doc ? toUsuarioDomain(doc) : null
  }

  async create(data: CreateUsuarioData): Promise<UsuarioDomain> {
    const doc = await UsuarioModel.create({
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role ?? 'owner',
    })
    // Re-fetch with hidden fields to return complete domain object
    const withFields = await UsuarioModel.findById(doc._id).select('+passwordHash +refreshToken')
    return toUsuarioDomain(withFields!)
  }

  async updateRefreshToken(id: string, hashedToken: string | null): Promise<void> {
    await UsuarioModel.findByIdAndUpdate(id, { refreshToken: hashedToken })
  }

  async findByRefreshToken(hashedToken: string): Promise<UsuarioDomain | null> {
    const doc = await UsuarioModel.findOne({ refreshToken: hashedToken }).select('+passwordHash +refreshToken')
    return doc ? toUsuarioDomain(doc) : null
  }

  async list(page = 1, limit = 20, search?: string): Promise<{ data: UsuarioDomain[]; total: number }> {
    const skip = (page - 1) * limit
    const query: Record<string, unknown> = {}
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ]
    }

    const [data, total] = await Promise.all([
      UsuarioModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-passwordHash -refreshToken'),
      UsuarioModel.countDocuments(query),
    ])

    return { data: data.map(toUsuarioDomain), total }
  }

  async update(id: string, data: { name?: string; role?: string }): Promise<UsuarioDomain | null> {
    const doc = await UsuarioModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).select('-passwordHash -refreshToken')
    return doc ? toUsuarioDomain(doc) : null
  }

  async delete(id: string): Promise<boolean> {
    const result = await UsuarioModel.findByIdAndDelete(id)
    return !!result
  }
}
