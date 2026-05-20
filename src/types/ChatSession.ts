export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatSession {
  _id: string
  negocioId: string
  clientePhone: string
  estado: 'active' | 'closed'
  historial: Message[]
  createdAt: Date
  updatedAt: Date
}
