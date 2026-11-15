import { describe, expect, it } from 'vitest'
import { ConfigurationError, loadConfig } from '../src/config/env'

const validProductionEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: 'production',
  PORT: '5000',
  MONGODB_URI: 'mongodb+srv://<username>:<password>@cluster.example.mongodb.net/campusconnect',
  MONGODB_DB_NAME: 'campusconnect',
  JWT_SECRET: '9f3c7a2b8d1e4f6c0a5b3d9e7f2c1a8b',
  JWT_EXPIRES_IN: '7d',
  CLIENT_URL: 'https://campusconnect.example',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX: '1000',
}

describe('production environment validation', () => {
  it('accepts a complete production environment', () => {
    expect(loadConfig(validProductionEnvironment).mongodbDbName).toBe('campusconnect')
  })

  it('rejects each missing production variable', () => {
    for (const name of Object.keys(validProductionEnvironment).filter((key) => key !== 'NODE_ENV')) {
      const environment = { ...validProductionEnvironment, [name]: undefined }
      expect(() => loadConfig(environment)).toThrow(new RegExp(`missing: .*${name}`))
    }
  })

  it('rejects local MongoDB hosts in production', () => {
    expect(() =>
      loadConfig({ ...validProductionEnvironment, MONGODB_URI: 'mongodb://127.0.0.1:27017/app' })
    ).toThrow(/invalid: MONGODB_URI/)
  })

  it('rejects malformed MongoDB URIs', () => {
    expect(() =>
      loadConfig({ ...validProductionEnvironment, MONGODB_URI: 'not-a-mongodb-uri' })
    ).toThrow(/invalid: MONGODB_URI/)
  })

  it('rejects default, placeholder, and short JWT secrets', () => {
    for (const jwtSecret of [
      'campusconnect_development_jwt_secret_dbs_2026',
      'replace-this-secret',
      'too-short',
      'x'.repeat(40),
    ]) {
      expect(() => loadConfig({ ...validProductionEnvironment, JWT_SECRET: jwtSecret })).toThrow(
        /invalid: JWT_SECRET/
      )
    }
  })

  it('rejects invalid numeric and client URL settings', () => {
    expect(() =>
      loadConfig({ ...validProductionEnvironment, PORT: 'not-a-port', CLIENT_URL: 'invalid' })
    ).toThrow(ConfigurationError)
  })

  it('rejects invalid token lifetime syntax', () => {
    expect(() =>
      loadConfig({ ...validProductionEnvironment, JWT_EXPIRES_IN: 'forever' })
    ).toThrow(/invalid: JWT_EXPIRES_IN/)
  })
})

describe('development environment defaults', () => {
  it('keeps local defaults and selects the campusconnect database', () => {
    const config = loadConfig({ NODE_ENV: 'development' })

    expect(config.mongodbUri).toBe('mongodb://localhost:27017/campusconnect')
    expect(config.mongodbDbName).toBe('campusconnect')
    expect(config.port).toBe(5000)
  })
})