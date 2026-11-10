import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from './config/env'
import { apiLimiter } from './middleware/rateLimiter'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes'
import { setupSwagger } from './config/swagger'
import { AppError } from './utils/apiResponse'

export const createApp = (): Express => {
  const app = express()

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI inline assets
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  )

  // CORS Configuration
  const allowedOrigins = [
    config.clientUrl,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ]

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
        if (!origin) {
          return callback(null, true)
        }

        const isAllowed =
          allowedOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          (config.nodeEnv !== 'production' && origin.startsWith('http://localhost:'))

        if (isAllowed) {
          callback(null, true)
        } else {
          callback(new AppError(`Origin ${origin} blocked by CORS security policy.`, 403))
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )

  // Body parsers
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true, limit: '2mb' }))

  // HTTP Request Logging
  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'))
  }

  // Rate Limiting
  app.use('/api', apiLimiter)

  // Health-check endpoint for Cloud Deployments (Render / AWS / Railway)
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      service: 'CampusConnect API',
    })
  })

  // OpenAPI / Swagger Documentation
  setupSwagger(app)

  // API Routes
  app.use('/api', routes)

  // Handle 404 for unmapped routes
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Endpoint not found: ${req.method} ${req.originalUrl}`, 404))
  })

  // Centralized Error Handling Middleware
  app.use(errorHandler)

  return app
}

