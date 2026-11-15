import mongoose from 'mongoose'
import { config } from './env'
import { logger } from '../utils/logger'

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB runtime connection error (${err.name || 'unknown error'}).`)
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
      dbName: config.mongodbDbName,
      serverSelectionTimeoutMS: 8000, // Fail fast if cluster is unreachable
    })
    logger.info(`MongoDB connected to database ${config.mongodbDbName}.`)
    return conn
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'unknown error'
    logger.error(`MongoDB connection failed (${errorName}). Check the Atlas network access list and database-user settings.`)
    throw error
  }
}

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect()
  logger.info('MongoDB disconnected gracefully.')
}

