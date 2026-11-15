import dotenv from 'dotenv'

dotenv.config()

const developmentJwtSecret = 'campusconnect_development_jwt_secret_dbs_2026'
const developmentMongoUri = 'mongodb://localhost:27017/campusconnect'

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

const requiredProductionVariables = [
  'PORT',
  'MONGODB_URI',
  'MONGODB_DB_NAME',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'CLIENT_URL',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX',
]

const isLocalMongoHost = (hostname: string): boolean => {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '::1' ||
    host === '0.0.0.0' ||
    host === '127.0.0.1' ||
    host.startsWith('127.')
  )
}

export const loadConfig = (env: NodeJS.ProcessEnv = process.env) => {
  const nodeEnv = env.NODE_ENV || 'development'
  const isProduction = nodeEnv === 'production'
  const missing: string[] = []
  const invalid: string[] = []

  if (isProduction) {
    for (const name of requiredProductionVariables) {
      if (!env[name]?.trim()) missing.push(name)
    }
  }

  const readInteger = (name: string, fallback: number): number => {
    const raw = env[name]
    if (!raw?.trim()) return fallback
    const value = Number(raw)
    if (!Number.isInteger(value) || value <= 0) {
      invalid.push(name)
      return fallback
    }
    return value
  }

  const port = readInteger('PORT', 5000)
  if (port > 65535) invalid.push('PORT')

  const mongodbUri = env.MONGODB_URI?.trim() || (isProduction ? '' : developmentMongoUri)
  if (mongodbUri) {
    try {
      const parsedUri = new URL(mongodbUri)
      if (
        !['mongodb:', 'mongodb+srv:'].includes(parsedUri.protocol) ||
        !parsedUri.hostname ||
        (isProduction && isLocalMongoHost(parsedUri.hostname))
      ) {
        invalid.push('MONGODB_URI')
      }
    } catch {
      invalid.push('MONGODB_URI')
    }
  }

  const mongodbDbName = env.MONGODB_DB_NAME?.trim() || 'campusconnect'
  if (!/^[A-Za-z0-9_-]+$/.test(mongodbDbName)) invalid.push('MONGODB_DB_NAME')

  const jwtSecret = env.JWT_SECRET?.trim() || (isProduction ? '' : developmentJwtSecret)
  const lowerJwtSecret = jwtSecret.toLowerCase()
  if (
    isProduction &&
    (jwtSecret.length < 32 ||
      new Set(jwtSecret).size < 12 ||
      jwtSecret === developmentJwtSecret ||
      /(change.?me|default|development|example|insecure|password|placeholder|sample|secret|test|your)/i.test(
        lowerJwtSecret
      ))
  ) {
    invalid.push('JWT_SECRET')
  }

  const jwtExpiresIn = env.JWT_EXPIRES_IN?.trim() || '7d'
  if (!/^\d+\s*(ms|s|m|h|d|w|y)?$/i.test(jwtExpiresIn)) invalid.push('JWT_EXPIRES_IN')
  const clientUrl = env.CLIENT_URL?.trim() || (isProduction ? '' : 'http://localhost:5173')
  if (clientUrl) {
    try {
      const parsedClientUrl = new URL(clientUrl)
      if (!['http:', 'https:'].includes(parsedClientUrl.protocol)) invalid.push('CLIENT_URL')
    } catch {
      invalid.push('CLIENT_URL')
    }
  }

  const rateLimitWindowMs = readInteger('RATE_LIMIT_WINDOW_MS', 900000)
  const rateLimitMax = readInteger('RATE_LIMIT_MAX', 1000)

  if (isProduction && (missing.length || invalid.length)) {
    const details = [
      missing.length ? `missing: ${[...new Set(missing)].join(', ')}` : '',
      invalid.length ? `invalid: ${[...new Set(invalid)].join(', ')}` : '',
    ].filter(Boolean)
    throw new ConfigurationError(`Invalid production configuration (${details.join('; ')}).`)
  }

  if (invalid.length) {
    throw new ConfigurationError(`Invalid configuration (${[...new Set(invalid)].join(', ')}).`)
  }

  return {
    port,
    nodeEnv,
    mongodbUri,
    mongodbDbName,
    jwtSecret,
    jwtExpiresIn,
    clientUrl,
    rateLimitWindowMs,
    rateLimitMax,
  }
}

export const config = loadConfig()

