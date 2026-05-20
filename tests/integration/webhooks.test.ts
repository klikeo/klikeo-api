import request from 'supertest'
import { createApp } from '@/infra/server'
import { connectDB, disconnectDB } from '@/infra/db'
import mongoose from 'mongoose'

const app = createApp()

beforeAll(async () => {
  process.env.WHATSAPP_VERIFY_TOKEN = 'test-verify-token'
  process.env.WHATSAPP_APP_SECRET = 'test-app-secret'
  process.env.JWT_SECRET = 'integration-test-secret'
  process.env.JWT_REFRESH_SECRET = 'integration-test-refresh-secret'
  await connectDB()
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await disconnectDB()
})

describe('GET /api/webhooks/whatsapp', () => {
  it('returns challenge when verify token matches', async () => {
    const challenge = 'abc123'
    const res = await request(app)
      .get('/api/webhooks/whatsapp')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'test-verify-token',
        'hub.challenge': challenge,
      })

    expect(res.status).toBe(200)
    expect(res.text).toBe(challenge)
  })

  it('returns 403 when verify token does not match', async () => {
    const res = await request(app)
      .get('/api/webhooks/whatsapp')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong-token',
        'hub.challenge': 'abc123',
      })

    expect(res.status).toBe(403)
  })
})

describe('POST /api/webhooks/whatsapp', () => {
  it('returns 200 immediately for valid webhook payload', async () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'ENTRY_ID',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '15551234567', phone_number_id: 'PHONE_ID' },
                messages: [
                  { from: '573001234567', id: 'MSG_ID', timestamp: '1700000000', text: { body: 'Hola' }, type: 'text' },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    }

    const res = await request(app)
      .post('/api/webhooks/whatsapp')
      .send(payload)

    expect(res.status).toBe(200)
  })

  it('returns 200 even without X-Hub-Signature-256 header (logs warning)', async () => {
    const res = await request(app)
      .post('/api/webhooks/whatsapp')
      .send({ object: 'whatsapp_business_account', entry: [] })

    expect(res.status).toBe(200)
  })
})
