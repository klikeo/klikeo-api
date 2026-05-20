export interface MessageDomain {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatSessionDomain {
  id: string
  negocioId: string
  clientePhone: string
  estado: 'active' | 'closed'
  historial: MessageDomain[]
  createdAt: Date
  updatedAt: Date
}
