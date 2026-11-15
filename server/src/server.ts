import { createApp } from './app'
import { connectDB, disconnectDB } from './config/db'
import { config, ConfigurationError } from './config/env'
import { logger } from './utils/logger'

const startServer = async () => {
  try {
    // Connect to database
    await connectDB()

    const app = createApp()

    const server = app.listen(config.port, () => {
      logger.info(`=========================================`)
      logger.info(` CampusConnect REST API Server Started `)
      logger.info(` Environment : ${config.nodeEnv}`)
      logger.info(` Port        : ${config.port}`)
      logger.info(` Healthcheck : http://localhost:${config.port}/health`)
      logger.info(` Swagger Docs: http://localhost:${config.port}/api/docs`)
      logger.info(`=========================================`)
    })

    // Graceful Shutdown handling
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`)
      server.close(async () => {
        logger.info('HTTP server closed.')
        try {
          await disconnectDB()
          logger.info('Database connection closed.')
          process.exit(0)
        } catch (err) {
          logger.error('Error during shutdown:', err)
          process.exit(1)
        }
      })
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
  } catch (error) {
    if (error instanceof ConfigurationError) {
      logger.error(error.message)
    } else {
      logger.error('Failed to start server. Check the database connection and application configuration.')
    }
    process.exit(1)
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer()
}

