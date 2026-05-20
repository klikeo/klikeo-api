import mongoose from 'mongoose'

export async function connectDB(uri?: string): Promise<void> {
  const mongoUri = uri ?? process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined')
  }
  await mongoose.connect(mongoUri)
  console.log('Connected to MongoDB')
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
}
