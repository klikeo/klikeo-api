import request from 'supertest'
import mongoose from 'mongoose'
import { createApp } from '../../src/infra/server'
import { connectDB, disconnectDB } from '../../src/infra/db'

const app = createApp()

beforeAll(async () => {
  process.env.JWT_SECRET = 'integration-test-secret'
  process.env.JWT_REFRESH_SECRET = 'integration-test-refresh-secret'
  await connectDB()
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await disconnectDB()
})

describe('POST /api/auth/register', () => {
  it('registers a new user and returns 201 with user data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'nuevo@test.com', password: 'password123', name: 'Nuevo Usuario' })

    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe('nuevo@test.com')
    expect(res.body.user).not.toHaveProperty('passwordHash')
    expect(res.body.user).not.toHaveProperty('refreshToken')
  })

  it('returns 409 if email already exists', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'duplicado@test.com', password: 'password123', name: 'Dup' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'duplicado@test.com', password: 'password123', name: 'Dup 2' })

    expect(res.status).toBe(409)
  })

  it('returns 400 if password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'short@test.com', password: '123', name: 'Short' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@test.com', password: 'password123', name: 'Login User' })
  })

  it('returns accessToken and sets refreshToken cookie on valid login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeTruthy()
    expect(res.body.user.email).toBe('login@test.com')
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('returns 401 on invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/refresh', () => {
  it('returns new accessToken when refreshToken cookie is valid', async () => {
    // First login to get a refresh token cookie
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' })

    const cookies = loginRes.headers['set-cookie']

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookies)

    expect(refreshRes.status).toBe(200)
    expect(refreshRes.body.accessToken).toBeTruthy()
  })

  it('returns 401 without refresh token cookie', async () => {
    const res = await request(app).post('/api/auth/refresh')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/logout', () => {
  it('clears refresh token and returns 200', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' })

    const { accessToken } = loginRes.body
    const cookies = loginRes.headers['set-cookie']

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookies)

    expect(logoutRes.status).toBe(200)
  })
})
