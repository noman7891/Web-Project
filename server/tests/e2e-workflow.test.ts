import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app'
import { User } from '../src/models/User'
import { signToken } from '../src/utils/jwt'
import './setup'

const app = createApp()

describe('End-to-End Real Campus Workflow Verification', () => {
  it('executes complete 10-step student and administrator lifecycle', async () => {
    // ------------------------------------------------------------------
    // Step 1: Student A registers a new student account
    // ------------------------------------------------------------------
    const regResA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Student',
        email: 'alice@student.dbs.ie',
        password: 'Password123!',
      })

    expect(regResA.status).toBe(201)
    expect(regResA.body.success).toBe(true)
    expect(regResA.body.data.user.role).toBe('student')
    expect(regResA.body.data.user.email).toBe('alice@student.dbs.ie')
    const studentAId = regResA.body.data.user.id

    // ------------------------------------------------------------------
    // Step 2: Student A logs in with credentials and acquires JWT token
    // ------------------------------------------------------------------
    const loginResA = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@student.dbs.ie',
        password: 'Password123!',
      })

    expect(loginResA.status).toBe(200)
    expect(loginResA.body.success).toBe(true)
    expect(loginResA.body.data.token).toBeDefined()
    const studentAToken = loginResA.body.data.token

    // ------------------------------------------------------------------
    // Step 3: Student A creates a lost listing (iPad Air)
    // ------------------------------------------------------------------
    const lostRes = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({
        title: 'Lost Space Grey iPad Air (5th Gen)',
        description: 'Left in library study room 304 with navy magnetic folio cover.',
        type: 'lost',
        category: 'Electronics',
        location: 'Castle House Library, Room 304',
        itemDate: '2026-11-04',
        contactInfo: 'alice@student.dbs.ie',
      })

    expect(lostRes.status).toBe(201)
    expect(lostRes.body.success).toBe(true)
    expect(lostRes.body.data.type).toBe('lost')
    expect(lostRes.body.data.status).toBe('active')
    const lostListingId = lostRes.body.data._id

    // ------------------------------------------------------------------
    // Step 4: Student B registers and views Student A’s listing in catalog
    // ------------------------------------------------------------------
    const regResB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Student',
        email: 'bob@student.dbs.ie',
        password: 'Password123!',
      })
    expect(regResB.status).toBe(201)
    const studentBToken = regResB.body.data.token
    const studentBId = regResB.body.data.user.id

    const viewRes = await request(app).get(`/api/listings/${lostListingId}`)
    expect(viewRes.status).toBe(200)
    expect(viewRes.body.data.title).toContain('iPad Air')
    expect(viewRes.body.data.userId.email).toBe('alice@student.dbs.ie')

    // ------------------------------------------------------------------
    // Step 5: Student B creates a found listing (Sony WH-1000XM4)
    // ------------------------------------------------------------------
    const foundRes = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${studentBToken}`)
      .send({
        title: 'Found Sony Wireless Headphones (Black)',
        description: 'Found on table in Aungier Street canteen next to vending machine.',
        type: 'found',
        category: 'Electronics',
        location: 'Aungier Street Canteen',
        itemDate: '2026-11-05',
        contactInfo: 'campus.security@dbs.ie',
      })

    expect(foundRes.status).toBe(201)
    expect(foundRes.body.data.type).toBe('found')
    expect(foundRes.body.data.status).toBe('active')
    const foundListingId = foundRes.body.data._id

    // ------------------------------------------------------------------
    // Step 6: Student A submits a private ownership claim for the found headphones
    // ------------------------------------------------------------------
    const claimRes = await request(app)
      .post('/api/claims')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({
        listingId: foundListingId,
        explanation: 'These are my Sony headphones! Bluetooth pairing name is "Alice-XM4" and there is a small silver scratch on the left pivot hinge.',
      })

    expect(claimRes.status).toBe(201)
    expect(claimRes.body.success).toBe(true)
    expect(claimRes.body.data.status).toBe('pending')
    expect(claimRes.body.data.claimantId._id).toBe(studentAId)
    const claimId = claimRes.body.data._id

    // ------------------------------------------------------------------
    // Step 7: Admin logs in and reviews pending claims queue
    // ------------------------------------------------------------------
    const adminUser = await User.create({
      name: 'Campus Security Officer',
      email: 'security.admin@campusconnect.dbs.ie',
      passwordHash: 'AdminSecurityPass2026!',
      role: 'admin',
    })
    const adminToken = signToken({
      id: adminUser._id.toString(),
      name: adminUser.name,
      email: adminUser.email,
      role: 'admin',
    })

    const adminQueueRes = await request(app)
      .get('/api/claims?status=pending')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(adminQueueRes.status).toBe(200)
    expect(adminQueueRes.body.success).toBe(true)
    const targetClaim = adminQueueRes.body.data.find((c: any) => c._id === claimId)
    expect(targetClaim).toBeDefined()
    expect(targetClaim.status).toBe('pending')

    // ------------------------------------------------------------------
    // Step 8: Admin approves the claim with collection instructions
    // ------------------------------------------------------------------
    const approveRes = await request(app)
      .patch(`/api/claims/${claimId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'approved',
        adminNote: 'Proof of Bluetooth device name and physical serial match verified. Ready for collection at Castle House Security Desk.',
      })

    expect(approveRes.status).toBe(200)
    expect(approveRes.body.success).toBe(true)
    expect(approveRes.body.data.status).toBe('approved')
    expect(approveRes.body.data.adminNote).toContain('Castle House Security Desk')

    // ------------------------------------------------------------------
    // Step 9: Student A views updated claim status and verified listing status
    // ------------------------------------------------------------------
    const studentClaimsRes = await request(app)
      .get('/api/claims/my-claims')
      .set('Authorization', `Bearer ${studentAToken}`)

    expect(studentClaimsRes.status).toBe(200)
    const approvedClaim = studentClaimsRes.body.data.find((c: any) => c._id === claimId)
    expect(approvedClaim.status).toBe('approved')
    expect(approvedClaim.adminNote).toContain('Ready for collection')

    // Verify found listing status was automatically updated to 'claimed'
    const updatedListingRes = await request(app).get(`/api/listings/${foundListingId}`)
    expect(updatedListingRes.status).toBe(200)
    expect(updatedListingRes.body.data.status).toBe('claimed')

    // ------------------------------------------------------------------
    // Step 10: Unauthorized student cannot access admin functions or dashboard
    // ------------------------------------------------------------------
    const dashRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${studentAToken}`)
    expect(dashRes.status).toBe(403)
    expect(dashRes.body.message).toContain('Forbidden')

    const usersRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${studentAToken}`)
    expect(usersRes.status).toBe(403)

    const unauthRes = await request(app).get('/api/admin/dashboard')
    expect(unauthRes.status).toBe(401)
  })
})
