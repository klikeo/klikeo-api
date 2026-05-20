import crypto from 'crypto'
import axios from 'axios'

const WHATSAPP_API_URL = 'https://graph.facebook.com/v20.0'

export interface WhatsAppMessage {
  from: string
  id: string
  timestamp: string
  text: { body: string }
  type: 'text'
}

export interface WhatsAppWebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: { display_phone_number: string; phone_number_id: string }
        messages?: WhatsAppMessage[]
        statuses?: unknown[]
      }
      field: string
    }>
  }>
}

export class WhatsAppService {
  // Read env vars lazily so tests can set them in beforeAll
  private get token() { return process.env.WHATSAPP_TOKEN ?? '' }
  private get phoneId() { return process.env.WHATSAPP_PHONE_ID ?? '' }
  private get verifyToken() { return process.env.WHATSAPP_VERIFY_TOKEN ?? '' }
  private get appSecret() { return process.env.WHATSAPP_APP_SECRET ?? '' }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = this.appSecret
    if (!secret) return false
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    const received = signature.replace('sha256=', '')
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
    } catch {
      return false
    }
  }

  verifyChallenge(mode: string, token: string): boolean {
    return mode === 'subscribe' && token === this.verifyToken
  }

  async sendMessage(to: string, body: string): Promise<void> {
    if (!this.token || !this.phoneId) {
      throw new Error('WhatsApp credentials not configured')
    }

    // Ensure phone number has + prefix
    const formattedTo = to.startsWith('+') ? to : `+${to}`

    console.log(`[WhatsApp] Sending to: ${formattedTo}`)

    try {
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${this.phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedTo,
          type: 'text',
          text: { body },
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      console.log(`[WhatsApp] Message sent successfully!`, response.data)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } }
      const errorMsg = err.response?.data?.error?.message || 'Unknown error'
      console.error(`[WhatsApp] Failed to send:`, errorMsg)
      throw new Error(`WhatsApp API error: ${errorMsg}`)
    }
  }

  extractMessages(payload: WhatsAppWebhookPayload): Array<{ from: string; body: string; phoneNumberId: string }> {
    const messages: Array<{ from: string; body: string; phoneNumberId: string }> = []
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field !== 'messages') continue
        const { messages: msgs, metadata } = change.value
        if (!msgs) continue
        for (const msg of msgs) {
          if (msg.type === 'text') {
            messages.push({
              from: msg.from,
              body: msg.text.body,
              phoneNumberId: metadata.phone_number_id,
            })
          }
        }
      }
    }
    return messages
  }
}
