import { ChatSessionDomain, MessageDomain } from '@/domain/ChatSession'

export interface CreateChatSessionData {
  negocioId: string
  clientePhone: string
}

export interface IChatSessionRepository {
  findById(id: string): Promise<ChatSessionDomain | null>
  findByNegocioId(negocioId: string, page?: number, limit?: number): Promise<{ data: ChatSessionDomain[]; total: number }>
  findOrCreate(negocioId: string, clientePhone: string): Promise<ChatSessionDomain>
  addMessage(sessionId: string, message: Omit<MessageDomain, 'timestamp'>): Promise<ChatSessionDomain>
  countByNegocioId(negocioId: string, since?: Date): Promise<number>
}
