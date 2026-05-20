import { Router, Request, Response } from 'express'
import { WhatsAppService, WhatsAppWebhookPayload } from '@/services/WhatsAppService'
import { DeepSeekService } from '@/services/DeepSeekService'
import { NegocioRepository } from '@/repositories/NegocioRepository'
import { ChatSessionRepository } from '@/repositories/ChatSessionRepository'
import { ProcessWhatsAppMessageUseCase } from '@/use-cases/chat/ProcessWhatsAppMessageUseCase'

const router = Router()
const whatsAppService = new WhatsAppService()
const deepSeekService = new DeepSeekService()
const negocioRepo = new NegocioRepository()
const chatSessionRepo = new ChatSessionRepository()
const processMessageUseCase = new ProcessWhatsAppMessageUseCase(
  negocioRepo,
  chatSessionRepo,
  deepSeekService,
  whatsAppService
)

// GET /api/webhooks/whatsapp — Meta webhook verification challenge
router.get('/whatsapp', (req: Request, res: Response): void => {
  const mode = req.query['hub.mode'] as string
  const token = req.query['hub.verify_token'] as string
  const challenge = req.query['hub.challenge'] as string

  if (whatsAppService.verifyChallenge(mode, token)) {
    res.status(200).send(challenge)
    return
  }

  res.status(403).json({ error: 'Verificación fallida' })
})

// POST /api/webhooks/whatsapp — incoming messages from Meta
router.post('/whatsapp', (req: Request, res: Response): void => {
  const signature = req.headers['x-hub-signature-256'] as string

  // Always respond 200 immediately — Meta requires fast ACK
  const rawBody = JSON.stringify(req.body)
  if (signature && !whatsAppService.verifyWebhookSignature(rawBody, signature)) {
    console.warn('WhatsApp webhook: invalid signature')
  }

  res.sendStatus(200)

  // Async processing — do not block the request
  const payload = req.body as WhatsAppWebhookPayload
  if (payload?.object !== 'whatsapp_business_account') return

  const messages = whatsAppService.extractMessages(payload)
  if (messages.length === 0) return

  // Process each message with the UseCase
  for (const msg of messages) {
    processMessageUseCase.execute({
      clientePhone: msg.from,
      messageBody: msg.body,
      phoneNumberId: msg.phoneNumberId,
    }).catch((err) => {
      console.error(`[WhatsApp] Error processing message:`, err)
    })
  }
})

export default router
