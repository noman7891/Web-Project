import { Router } from 'express'
import authRoutes from './authRoutes'
import listingRoutes from './listingRoutes'
import claimRoutes from './claimRoutes'
import adminRoutes from './adminRoutes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/listings', listingRoutes)
router.use('/claims', claimRoutes)
router.use('/admin', adminRoutes)

export default router

