import { Router } from 'express'
import { AdminController } from '../controllers/adminController'
import { authenticate } from '../middleware/auth'
import { authorize } from '../middleware/role'

const router = Router()

// All routes under /api/admin require authentication and admin role
router.use(authenticate, authorize('admin'))

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Retrieve system-wide statistics and metrics
 */
router.get('/dashboard', AdminController.getDashboard)

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Retrieve user directory
 */
router.get('/users', AdminController.getUsers)

/**
 * @swagger
 * /api/admin/users/:id/status:
 *   patch:
 *     summary: Toggle user active status
 */
router.patch('/users/:id/status', AdminController.updateUserStatus)

export default router

