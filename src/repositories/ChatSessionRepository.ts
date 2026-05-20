import mongoose, { Schema, Document } from 'mongoose'
import { ChatSessionDomain, MessageDomain } from '@/domain/ChatSession'
import { IChatSessionRepository } from './interfaces/IChatSessionRepository'

interface MessageDoc {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSessionDoc extends Document {
  negocioId: mongoose.Types.ObjectId
  clientePhone: string
  estado: 'active' | 'closed'
  historial: MessageDoc[]
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<MessageDoc>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
)

const ChatSessionSchema = new Schema<ChatSessionDoc>(
  {
    negocioId: { type: Schema.Types.ObjectId, ref: 'Negocio', required: true },
    clientePhone: { type: String, required: true },
    estado: { type: String, enum: ['active', 'closed'], default: 'active' },
    historial: [MessageSchema],
  },
  { timestamps: true }
)

const ChatSessionModel = mongoose.model<ChatSessionDoc>('ChatSession', ChatSessionSchema)

function toChatSessionDomain(doc: ChatSessionDoc): ChatSessionDomain {
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
  }
}

export class ChatSessionRepository implements IChatSessionRepository {
  async findById(id: string): Promise<ChatSessionDomain | null> {
    const doc = await ChatSessionModel.findById(id)
    return doc ? toChatSessionDomain(doc) : null
  }

  async findByNegocioId(negocioId: string, page = 1, limit = 20): Promise<{ data: ChatSessionDomain[]; total: number }> {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      ChatSessionModel.find({ negocioId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      ChatSessionModel.countDocuments({ negocioId }),
    ])
    return { data: data.map(toChatSessionDomain), total }
  }

  async findOrCreate(negocioId: string, clientePhone: string): Promise<ChatSessionDomain> {
    let doc = await ChatSessionModel.findOne({ negocioId, clientePhone, estado: 'active' })
    if (!doc) {
      doc = await ChatSessionModel.create({ negocioId, clientePhone })
    }
    return toChatSessionDomain(doc)
  }

  async addMessage(sessionId: string, message: Omit<MessageDomain, 'timestamp'>): Promise<ChatSessionDomain> {
    const doc = await ChatSessionModel.findByIdAndUpdate(
      sessionId,
      { $push: { historial: { ...message, timestamp: new Date() } } },
      { new: true }
    )
    if (!doc) throw new Error('ChatSession not found')
    return toChatSessionDomain(doc)
  }

  async countByNegocioId(negocioId: string, since?: Date): Promise<number> {
    const query: Record<string, unknown> = { negocioId }
    if (since) query.createdAt = { $gte: since }
    return ChatSessionModel.countDocuments(query)
  }

  async list(page = 1, limit = 20): Promise<{ data: ChatSessionDomain[]; total: number }> {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      ChatSessionModel.find().sort({ updatedAt: -1 }).skip(skip).limit(limit),
      ChatSessionModel.countDocuments(),
    ])
    return { data: data.map(toChatSessionDomain), total }
  }
}
