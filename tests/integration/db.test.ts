import mongoose from 'mongoose'
import { connectDB, disconnectDB } from '../../src/infra/db'

describe('Database Connection', () => {
  afterEach(async () => {
    await disconnectDB()
  })

  it('connects to MongoDB using MONGODB_URI from env', async () => {
    // MONGODB_URI is set by globalSetup to point to mongodb-memory-server
    await connectDB()
    expect(mongoose.connection.readyState).toBe(1) // 1 = connected
  })

  it('throws when MONGODB_URI is not provided', async () => {
    await expect(connectDB('')).rejects.toThrow('MONGODB_URI is not defined')
  })

  it('disconnects cleanly', async () => {
    await connectDB()
    await disconnectDB()
    expect(mongoose.connection.readyState).toBe(0) // 0 = disconnected
  })
})
