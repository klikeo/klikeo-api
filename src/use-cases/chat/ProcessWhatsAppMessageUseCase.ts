import { INegocioRepository } from '@/repositories/interfaces/INegocioRepository'
import { IChatSessionRepository } from '@/repositories/interfaces/IChatSessionRepository'
import { IDeepSeekService, DeepSeekMessage } from '@/services/DeepSeekService'
import { WhatsAppService } from '@/services/WhatsAppService'

export interface ProcessMessageInput {
  clientePhone: string
  messageBody: string
  phoneNumberId: string
}

export class ProcessWhatsAppMessageUseCase {
  constructor(
    private readonly negocioRepo: INegocioRepository,
    private readonly chatSessionRepo: IChatSessionRepository,
    private readonly deepSeekService: IDeepSeekService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  async execute(input: ProcessMessageInput): Promise<void> {
    const { clientePhone, messageBody, phoneNumberId } = input

    // 1. Find the negocio by the WhatsApp phone number ID
    const negocio = await this.negocioRepo.findByWhatsappPhoneId(phoneNumberId)
    if (!negocio) {
      console.warn(`[Chatbot] No negocio found for phoneNumberId: ${phoneNumberId}`)
      return
    }

    // 2. Find or create the chat session
    const session = await this.chatSessionRepo.findOrCreate(negocio.id, clientePhone)

    // 3. Save the user's message to the session
    await this.chatSessionRepo.addMessage(session.id, {
      role: 'user',
      content: messageBody,
    })

    // 4. Build the system prompt with training data
    const systemPrompt = negocio.trainingData
      ? `Eres el asistente virtual de ${negocio.name}. Responde únicamente usando la siguiente información del negocio: ${negocio.trainingData}. Si no sabes la respuesta, indica que no tienes esa información y sugiere contactar directamente al negocio. Sé amable, conciso y en español.`
      : `Eres el asistente virtual de ${negocio.name} en ${negocio.city}. Responde de manera amable y concisa en español. Si no tienes información específica, indica que el cliente contacte directamente al negocio.`

    // 5. Build the message history for DeepSeek (last 10 messages to avoid token limit)
    const history = session.historial.slice(-10)
    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ]

    // 6. Call DeepSeek
    const assistantReply = await this.deepSeekService.chat(messages)

    // 7. Save the assistant's response
    await this.chatSessionRepo.addMessage(session.id, {
      role: 'assistant',
      content: assistantReply,
    })

    // 8. Send the response via WhatsApp
    await this.whatsAppService.sendMessage(clientePhone, assistantReply)
  }
}
