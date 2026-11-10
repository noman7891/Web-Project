import mongoose from 'mongoose'
import { config } from './env'
import { logger } from '../utils/logger'

/**
 * Safely masks username/password in MongoDB connection URIs to prevent credential leakage in logs
 */
export const maskMongoUri = (uri: string): string => {
  return uri.replace(/\/\/(.*?):(.*?)@/, '//$1:********@')
}

// Lifecycle event listeners for robust cloud connectivity
mongoose.connection.on('error', (err) => {
  const errMsg = err instanceof Error ? err.message : String(err)
  logger.error('MongoDB runtime connection error:', errMsg)
})

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost. Awaiting automatic reconnection...')
})

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected successfully.')
})

export const connectDB = async (uri?: string): Promise<typeof mongoose> => {
  const connectionUri = uri || config.mongodbUri
  try {
    const conn = await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 8000, // Fail fast if cluster is unreachable
    })
    logger.info(`MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    const safeErrorMsg = error instanceof Error ? error.message : String(error)
    logger.error('Error connecting to MongoDB:', safeErrorMsg)
    logger.warn(
      `Notice: Failed to connect using URI target: ${maskMongoUri(connectionUri)}. Please verify MONGODB_URI in server/.env or cloud environment (see docs/atlas-setup-guide.md).`
    )
    if (config.nodeEnv === 'production') {
      process.exit(1)
    }
    throw error
  }
}

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect()
  logger.info('MongoDB disconnected gracefully.')
}

