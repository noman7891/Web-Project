import { Router } from 'express'
import { AuthController } from '../controllers/authController'
import { validateBody } from '../middleware/validate'
import { registerSchema, loginSchema } from '../validators/authSchemas'
import { authenticate } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimiter'

const router = Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new student account
 */
router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  AuthController.register
)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user & get JWT token
 */
router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  AuthController.login
)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 */
router.get(
  '/me',
  authenticate,
  AuthController.getMe
)

export default router

