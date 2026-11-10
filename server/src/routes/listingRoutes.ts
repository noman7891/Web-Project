import { Router } from 'express'
import { ListingController } from '../controllers/listingController'
import { authenticate } from '../middleware/auth'
import { validateBody, validateQuery } from '../middleware/validate'
import {
  createListingSchema,
  updateListingSchema,
  queryListingSchema,
} from '../validators/listingSchemas'

const router = Router()

/**
 * @swagger
 * /api/listings:
 *   get:
 *     summary: Retrieve published listings with filters and pagination
 *   post:
 *     summary: Create a new lost or found listing
 */
router.get('/', validateQuery(queryListingSchema), ListingController.getListings)

router.get('/my-listings', authenticate, ListingController.getMyListings)

router.get('/:id', ListingController.getListingById)

router.post(
  '/',
  authenticate,
  validateBody(createListingSchema),
  ListingController.createListing
)

router.put(
  '/:id',
  authenticate,
  validateBody(updateListingSchema),
  ListingController.updateListing
)

router.delete('/:id', authenticate, ListingController.deleteListing)

export default router

