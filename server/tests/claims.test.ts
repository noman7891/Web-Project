import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app'
import { User } from '../src/models/User'
import { Listing } from '../src/models/Listing'
import { Claim } from '../src/models/Claim'
import { signToken } from '../src/utils/jwt'
import './setup'

const app = createApp()

describe('Claims Endpoints (/api/claims)', () => {
  let finderToken: string
  let finderId: string
  let claimantToken: string
  let claimantId: string
  let adminToken: string
  let foundListingId: string

  beforeEach(async () => {
    // Finder student
    const finder = await User.create({
      name: 'Finder Student',
      email: 'finder@student.dbs.ie',
      passwordHash: 'Pass123!',
      role: 'student',
    })
    finderId = finder._id.toString()
    finderToken = signToken({
      id: finderId,
      name: finder.name,
      email: finder.email,
      role: 'student',
    })

    // Claimant student
    const claimant = await User.create({
      name: 'Claimant Student',
      email: 'claimant@student.dbs.ie',
      passwordHash: 'Pass123!',
      role: 'student',
    })
    claimantId = claimant._id.toString()
    claimantToken = signToken({
      id: claimantId,
      name: claimant.name,
      email: claimant.email,
      role: 'student',
    })

    // Admin
    const admin = await User.create({
      name: 'Security Admin',
      email: 'admin@campusconnect.dbs.ie',
      passwordHash: 'AdminPass123!',
      role: 'admin',
    })
    adminToken = signToken({
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: 'admin',
    })

    // Found listing
    const listing = await Listing.create({
      title: 'Found Apple Watch Series 8',
      description: 'Black sport band, found in gym locker room.',
      type: 'found',
      category: 'Electronics',
      location: 'Campus Sports Hall',
      itemDate: new Date(),
      status: 'active',
      userId: finderId,
      contactInfo: 'finder@student.dbs.ie',
    })
    foundListingId = listing._id.toString()
  })

  describe('POST /api/claims', () => {
    it('should submit claim successfully for a found item', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${claimantToken}`)
        .send({
          listingId: foundListingId,
          explanation: 'This is my watch. It has a Nike watch face and a scratch on the top bezel.',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('pending')
      expect(res.body.data.claimantId._id).toBe(claimantId)
    })

    it('should disallow finder from claiming their own found listing', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({
          listingId: foundListingId,
          explanation: 'Trying to claim the item I found myself.',
        })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('cannot file a claim on an item that you reported')
    })

    it('should prevent duplicate pending claims from the same student', async () => {
      await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${claimantToken}`)
        .send({
          listingId: foundListingId,
          explanation: 'First claim submission with ownership proof details.',
        })

      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${claimantToken}`)
        .send({
          listingId: foundListingId,
          explanation: 'Second attempt to claim same item again.',
        })

      expect(res.status).toBe(409)
      expect(res.body.message).toContain('already have a pending claim')
    })
  })

  describe('PATCH /api/claims/:id/status (Admin Review)', () => {
    let claimId: string

    beforeEach(async () => {
      const claim = await Claim.create({
        listingId: foundListingId,
        claimantId: claimantId,
        explanation: 'Detailed ownership proof description.',
        status: 'pending',
      })
      claimId = claim._id.toString()
    })

    it('should disallow non-admin from approving or rejecting claims', async () => {
      const res = await request(app)
        .patch(`/api/claims/${claimId}/status`)
        .set('Authorization', `Bearer ${claimantToken}`)
        .send({
          status: 'approved',
          adminNote: 'Self-approval attempt',
        })

      expect(res.status).toBe(403)
    })

    it('should allow admin to approve claim and update listing to claimed', async () => {
      const res = await request(app)
        .patch(`/api/claims/${claimId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved',
          adminNote: 'Ownership verified via serial number. Ready for collection at Security.',
        })

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('approved')
      expect(res.body.data.adminNote).toContain('Ownership verified')

      // Verify listing status was updated to claimed
      const updatedListing = await Listing.findById(foundListingId)
      expect(updatedListing?.status).toBe('claimed')
    })

    it('should allow admin to reject claim without changing listing status', async () => {
      const res = await request(app)
        .patch(`/api/claims/${claimId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'rejected',
          adminNote: 'Description does not match physical item.',
        })

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('rejected')

      const listing = await Listing.findById(foundListingId)
      expect(listing?.status).toBe('active')
    })
  })
})

