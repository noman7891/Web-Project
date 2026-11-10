import { Router } from 'express'
import { ClaimController } from '../controllers/claimController'
import { authenticate } from '../middleware/auth'
import { authorize } from '../middleware/role'
import { validateBody } from '../middleware/validate'
import { createClaimSchema, updateClaimStatusSchema } from '../validators/claimSchemas'

const router = Router()

/**
 * @swagger
 * /api/claims:
 *   post:
 *     summary: Submit an ownership claim for a found item
 *   get:
 *     summary: Admin retrieval of claims
 */
router.post(
  '/',
  authenticate,
  validateBody(createClaimSchema),
  ClaimController.createClaim
)

router.get(
  '/my-claims',
  authenticate,
  ClaimController.getMyClaims
)

router.get(
  '/',
  authenticate,
  authorize('admin'),
  ClaimController.getAllClaims
)

router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validateBody(updateClaimStatusSchema),
  ClaimController.updateClaimStatus
)

export default router

