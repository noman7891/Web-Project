import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app'
import { User } from '../src/models/User'
import { Listing } from '../src/models/Listing'
import { signToken } from '../src/utils/jwt'
import './setup'

const app = createApp()

describe('Listings Endpoints (/api/listings)', () => {
  let studentToken: string
  let studentId: string
  let otherStudentToken: string
  let adminToken: string

  beforeEach(async () => {
    // Create Student 1
    const student1 = await User.create({
      name: 'Student One',
      email: 's1@student.dbs.ie',
      passwordHash: 'Pass123!',
      role: 'student',
    })
    studentId = student1._id.toString()
    studentToken = signToken({
      id: studentId,
      name: student1.name,
      email: student1.email,
      role: 'student',
    })

    // Create Student 2
    const student2 = await User.create({
      name: 'Student Two',
      email: 's2@student.dbs.ie',
      passwordHash: 'Pass123!',
      role: 'student',
    })
    otherStudentToken = signToken({
      id: student2._id.toString(),
      name: student2.name,
      email: student2.email,
      role: 'student',
    })

    // Create Admin
    const admin = await User.create({
      name: 'Campus Admin',
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
  })

  describe('POST /api/listings', () => {
    it('should create a new listing when authenticated', async () => {
      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Lost Casio Scientific Calculator',
          description: 'Dark blue Casio FX-991EX left on desk in Room 3.4.',
          type: 'lost',
          category: 'Electronics',
          location: 'Castle House Room 3.4',
          itemDate: '2026-11-04',
          contactInfo: 's1@student.dbs.ie',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.title).toBe('Lost Casio Scientific Calculator')
      expect(res.body.data.status).toBe('active')
      expect(res.body.data.userId._id).toBe(studentId)
    })

    it('should reject unauthenticated listing creation', async () => {
      const res = await request(app)
        .post('/api/listings')
        .send({
          title: 'Lost Item',
          description: 'Some description about item.',
          type: 'lost',
          category: 'Keys',
          location: 'Library',
          itemDate: '2026-11-04',
          contactInfo: 'email@test.com',
        })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/listings', () => {
    beforeEach(async () => {
      await Listing.create([
        {
          title: 'Found Keys with green tag',
          description: 'Two keys on a ring found in canteen.',
          type: 'found',
          category: 'Keys',
          location: 'Aungier Canteen',
          itemDate: new Date('2026-11-01'),
          status: 'active',
          userId: studentId,
          contactInfo: 's1@student.dbs.ie',
        },
        {
          title: 'Lost Black Wallet',
          description: 'Leather wallet containing cards.',
          type: 'lost',
          category: 'Cards & ID',
          location: 'Library Ground Floor',
          itemDate: new Date('2026-11-02'),
          status: 'active',
          userId: studentId,
          contactInfo: 's1@student.dbs.ie',
        },
      ])
    })

    it('should retrieve active listings with pagination', async () => {
      const res = await request(app).get('/api/listings')
      expect(res.status).toBe(200)
      expect(res.body.data.listings.length).toBe(2)
      expect(res.body.data.pagination.total).toBe(2)
    })

    it('should filter listings by type', async () => {
      const res = await request(app).get('/api/listings?type=found')
      expect(res.status).toBe(200)
      expect(res.body.data.listings.length).toBe(1)
      expect(res.body.data.listings[0].type).toBe('found')
    })

    it('should filter listings by category', async () => {
      const res = await request(app).get('/api/listings?category=Keys')
      expect(res.status).toBe(200)
      expect(res.body.data.listings.length).toBe(1)
      expect(res.body.data.listings[0].category).toBe('Keys')
    })
  })

  describe('PUT /api/listings/:id', () => {
    let listingId: string

    beforeEach(async () => {
      const listing = await Listing.create({
        title: 'Original Title',
        description: 'Original description text here.',
        type: 'lost',
        category: 'Keys',
        location: 'Study Area',
        itemDate: new Date(),
        status: 'active',
        userId: studentId,
        contactInfo: 's1@student.dbs.ie',
      })
      listingId = listing._id.toString()
    })

    it('should allow the owner to update listing', async () => {
      const res = await request(app)
        .put(`/api/listings/${listingId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Updated Title' })

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('Updated Title')
    })

    it('should disallow another student from updating the listing', async () => {
      const res = await request(app)
        .put(`/api/listings/${listingId}`)
        .set('Authorization', `Bearer ${otherStudentToken}`)
        .send({ title: 'Malicious Update' })

      expect(res.status).toBe(403)
      expect(res.body.message).toContain('only edit your own')
    })

    it('should allow an administrator to moderate and update listing', async () => {
      const res = await request(app)
        .put(`/api/listings/${listingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'archived' })

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('archived')
    })
  })

  describe('DELETE /api/listings/:id', () => {
    let listingId: string

    beforeEach(async () => {
      const listing = await Listing.create({
        title: 'Item to delete',
        description: 'This item will be deleted shortly.',
        type: 'found',
        category: 'Electronics',
        location: 'Hallway',
        itemDate: new Date(),
        status: 'active',
        userId: studentId,
        contactInfo: 's1@student.dbs.ie',
      })
      listingId = listing._id.toString()
    })

    it('should allow owner to delete listing', async () => {
      const res = await request(app)
        .delete(`/api/listings/${listingId}`)
        .set('Authorization', `Bearer ${studentToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const check = await Listing.findById(listingId)
      expect(check).toBeNull()
    })

    it('should allow admin to delete any listing', async () => {
      const res = await request(app)
        .delete(`/api/listings/${listingId}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('should reject non-owner student from deleting', async () => {
      const res = await request(app)
        .delete(`/api/listings/${listingId}`)
        .set('Authorization', `Bearer ${otherStudentToken}`)

      expect(res.status).toBe(403)
    })
  })
})

