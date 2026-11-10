import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app'
import { User } from '../src/models/User'
import './setup'

const app = createApp()

describe('Auth Endpoints (/api/auth)', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new student account successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Ciaran O’Connor',
          email: 'ciaran@student.dbs.ie',
          password: 'Password123!',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user.email).toBe('ciaran@student.dbs.ie')
      expect(res.body.data.user.role).toBe('student')
      expect(res.body.data.user.name).toBe('Ciaran O’Connor')
      expect(res.body.data.token).toBeDefined()
      expect(res.body.data.user.passwordHash).toBeUndefined()
    })

    it('should reject registration if email is already taken', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          email: 'duplicate@student.dbs.ie',
          password: 'Password123!',
        })

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: 'duplicate@student.dbs.ie',
          password: 'Password123!',
        })

      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('already exists')
    })

    it('should force role to student even if admin role is supplied in payload', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker User',
          email: 'hacker@student.dbs.ie',
          password: 'Password123!',
          role: 'admin',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.user.role).toBe('student')
    })

    it('should return 400 when registration fields are missing or invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A', // too short
          email: 'not-an-email',
          password: '123', // too short
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.errors).toBeDefined()
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Test Student',
        email: 'test@student.dbs.ie',
        passwordHash: 'ValidPassword123!',
        role: 'student',
      })
    })

    it('should login with valid credentials and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@student.dbs.ie',
          password: 'ValidPassword123!',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.token).toBeDefined()
      expect(res.body.data.user.email).toBe('test@student.dbs.ie')
    })

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@student.dbs.ie',
          password: 'WrongPassword!',
        })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('Invalid email or password')
    })

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ghost@student.dbs.ie',
          password: 'ValidPassword123!',
        })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user profile when valid token is provided', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@student.dbs.ie',
          password: 'Password123!',
        })

      const token = regRes.body.data.token

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.name).toBe('Jane Doe')
      expect(res.body.data.email).toBe('jane@student.dbs.ie')
    })

    it('should return 401 when token is missing', async () => {
      const res = await request(app).get('/api/auth/me')
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })
})
