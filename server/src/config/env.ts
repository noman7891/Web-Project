import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const nodeEnv = process.env.NODE_ENV || 'development'
const jwtSecret = process.env.JWT_SECRET || 'campusconnect_development_jwt_secret_dbs_2026'

if (nodeEnv === 'production' && jwtSecret === 'campusconnect_development_jwt_secret_dbs_2026') {
  console.warn(
    '[SECURITY WARNING] Running in production with default JWT_SECRET. Please configure a unique 256-bit secret in your deployment environment.'
  )
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
}

