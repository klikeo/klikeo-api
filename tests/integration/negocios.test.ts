import request from 'supertest'
import mongoose from 'mongoose'
import { createApp } from '@/infra/server'
import { connectDB, disconnectDB } from '@/infra/db'

const app = createApp()

let accessToken: string
let negocioId: string

const testUser = { email: 'owner@negocios.com', password: 'password123', name: 'Dueño Test' }
const testNegocio = {
  name: 'Panadería El Sol',
  category: 'alimentos',
  city: 'Bogotá',
  whatsappNumber: '+573001234567',
  description: 'La mejor panadería',
}

beforeAll(async () => {
  process.env.JWT_SECRET = 'integration-test-secret'
  process.env.JWT_REFRESH_SECRET = 'integration-test-refresh-secret'
  await connectDB()

  // Register + login to get access token
  await request(app).post('/api/auth/register').send(testUser)
  const loginRes = await request(app).post('/api/auth/login').send({
    email: testUser.email,
    password: testUser.password,
  })
  accessToken = loginRes.body.accessToken
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await disconnectDB()
})

describe('POST /api/negocios', () => {
  it('creates a negocio for authenticated owner', async () => {
    const res = await request(app)
      .post('/api/negocios')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(testNegocio)

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Panadería El Sol')
    expect(res.body.city).toBe('Bogotá')
    negocioId = res.body.id
  })

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/negocios').send(testNegocio)
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid category', async () => {
    const res = await request(app)
      .post('/api/negocios')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...testNegocio, category: 'INVALIDA' })

    expect(res.status).toBe(400)
  })
})

describe('GET /api/negocios', () => {
  it('returns paginated list of negocios', async () => {
    const res = await request(app).get('/api/negocios')

    expect(res.status).toBe(200)
    expect(res.body.data).toBeInstanceOf(Array)
    expect(typeof res.body.total).toBe('number')
    expect(res.body.page).toBe(1)
  })

  it('filters by city', async () => {
    const res = await request(app).get('/api/negocios?city=Bogotá')

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('filters by category', async () => {
    const res = await request(app).get('/api/negocios?category=alimentos')

    expect(res.status).toBe(200)
    expect(res.body.data.every((n: { category: string }) => n.category === 'alimentos')).toBe(true)
  })
})

describe('GET /api/negocios/:id', () => {
  it('returns negocio by id', async () => {
    const res = await request(app).get(`/api/negocios/${negocioId}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(negocioId)
    expect(res.body.name).toBe('Panadería El Sol')
  })

  it('returns 404 for non-existent id', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString()
    const res = await request(app).get(`/api/negocios/${fakeId}`)
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/negocios/:id', () => {
  it('updates negocio for the owner', async () => {
    const res = await request(app)
      .put(`/api/negocios/${negocioId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Panadería El Sol Actualizada' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Panadería El Sol Actualizada')
  })

  it('returns 403 if another user tries to update', async () => {
    // Register another user
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'otro@test.com', password: 'password123', name: 'Otro' })
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'otro@test.com', password: 'password123' })
    const otherToken = loginRes.body.accessToken

    const res = await request(app)
      .put(`/api/negocios/${negocioId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ name: 'Hack' })

    expect(res.status).toBe(403)
  })

  it('returns 401 without token', async () => {
    const res = await request(app)
      .put(`/api/negocios/${negocioId}`)
      .send({ name: 'Test' })
    expect(res.status).toBe(401)
  })
})
