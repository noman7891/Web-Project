import { vi, beforeEach } from 'vitest'
import { Types } from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from '../src/models/User'
import { Listing } from '../src/models/Listing'
import { Claim } from '../src/models/Claim'

// In-Memory Data Stores
const users = new Map<string, any>()
const listings = new Map<string, any>()
const claims = new Map<string, any>()

// Helper to simulate Mongoose document
const createMockUserDoc = (data: any) => {
  const _id = data._id ? new Types.ObjectId(data._id) : new Types.ObjectId()
  const doc = {
    ...data,
    _id,
    id: _id.toString(),
    isActive: data.isActive !== undefined ? data.isActive : true,
    role: data.role || 'student',
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    comparePassword: async function (candidate: string) {
      return bcrypt.compare(candidate, this.passwordHash)
    },
    save: async function () {
      users.set(this._id.toString(), this)
      return this
    },
    toJSON: function () {
      const copy = { ...this }
      delete copy.passwordHash
      delete copy.__v
      return copy
    },
  }
  return doc
}

const createMockListingDoc = (data: any) => {
  const _id = data._id ? new Types.ObjectId(data._id) : new Types.ObjectId()
  const doc = {
    ...data,
    _id,
    id: _id.toString(),
    status: data.status || 'active',
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    save: async function () {
      listings.set(this._id.toString(), this)
      return this
    },
    populate: async function () {
      const u = users.get(this.userId?.toString?.() || this.userId)
      if (u) {
        this.userId = { _id: u._id.toString(), name: u.name, email: u.email, role: u.role }
      }
      return this
    },
    toJSON: function () {
      const copy = { ...this }
      delete copy.__v
      return copy
    },
  }
  return doc
}

const createMockClaimDoc = (data: any) => {
  const _id = data._id ? new Types.ObjectId(data._id) : new Types.ObjectId()
  const doc = {
    ...data,
    _id,
    id: _id.toString(),
    status: data.status || 'pending',
    adminNote: data.adminNote || '',
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    save: async function () {
      claims.set(this._id.toString(), this)
      return this
    },
    populate: async function () {
      const l = listings.get(this.listingId?.toString?.() || this.listingId)
      if (l) {
        this.listingId = {
          _id: l._id.toString(),
          title: l.title,
          type: l.type,
          category: l.category,
          location: l.location,
          itemDate: l.itemDate,
          image: l.image,
          status: l.status,
        }
      }
      const u = users.get(this.claimantId?.toString?.() || this.claimantId)
      if (u) {
        this.claimantId = { _id: u._id.toString(), name: u.name, email: u.email, role: u.role }
      }
      return this
    },
    toJSON: function () {
      const copy = { ...this }
      delete copy.__v
      return copy
    },
  }
  return doc
}

// Mock User Model
vi.spyOn(User, 'create').mockImplementation(async (input: any) => {
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(input.passwordHash, salt)
  const userDoc = createMockUserDoc({
    ...input,
    passwordHash,
  })
  users.set(userDoc._id.toString(), userDoc)
  return userDoc as any
})

vi.spyOn(User, 'findOne').mockImplementation((query: any) => {
  let found = null
  for (const u of users.values()) {
    if (query.email && u.email === query.email.toLowerCase()) {
      found = u
      break
    }
  }
  return Promise.resolve(found) as any
})

vi.spyOn(User, 'findById').mockImplementation((id: any) => {
  const u = users.get(id?.toString())
  const chain = {
    select: () => Promise.resolve(u),
    then: (resolve: any) => Promise.resolve(u).then(resolve),
  }
  return chain as any
})

vi.spyOn(User, 'find').mockImplementation(() => {
  const list = Array.from(users.values())
  const chain = {
    select: () => chain,
    sort: () => chain,
    lean: () => Promise.resolve(list),
    then: (resolve: any) => Promise.resolve(list).then(resolve),
  }
  return chain as any
})

vi.spyOn(User, 'countDocuments').mockImplementation(async (query: any = {}) => {
  let count = 0
  for (const u of users.values()) {
    if (query.role && u.role !== query.role) continue
    count++
  }
  return count
})

vi.spyOn(User, 'deleteMany').mockImplementation(async () => {
  users.clear()
  return {} as any
})

// Mock Listing Model
vi.spyOn(Listing, 'create').mockImplementation(async (input: any) => {
  if (Array.isArray(input)) {
    const created = input.map((item) => {
      const doc = createMockListingDoc(item)
      listings.set(doc._id.toString(), doc)
      return doc
    })
    return created as any
  }
  const doc = createMockListingDoc(input)
  listings.set(doc._id.toString(), doc)
  return doc as any
})

vi.spyOn(Listing, 'findById').mockImplementation((id: any) => {
  const item = listings.get(id?.toString()) || null
  const chain = {
    populate: async () => {
      if (item) await item.populate()
      return item
    },
    then: (resolve: any) => Promise.resolve(item).then(resolve),
  }
  return chain as any
})

vi.spyOn(Listing, 'findByIdAndUpdate').mockImplementation(async (id: any, update: any) => {
  const idStr = (id?._id || id)?.toString()
  const item = listings.get(idStr)
  if (item) {
    Object.assign(item, update)
  }
  return item as any
})

vi.spyOn(Listing, 'findByIdAndDelete').mockImplementation(async (id: any) => {
  const item = listings.get(id?.toString())
  listings.delete(id?.toString())
  return item as any
})

vi.spyOn(Listing, 'find').mockImplementation((query: any = {}) => {
  let result = Array.from(listings.values())
  if (query.type) {
    result = result.filter((l) => l.type === query.type)
  }
  if (query.category) {
    result = result.filter((l) => l.category === query.category)
  }
  if (query.status) {
    result = result.filter((l) => l.status === query.status)
  }
  if (query.userId) {
    result = result.filter((l) => l.userId.toString() === query.userId.toString())
  }

  const chain = {
    populate: () => chain,
    sort: () => chain,
    skip: () => chain,
    limit: () => chain,
    lean: () => Promise.resolve(result),
    then: (resolve: any) => Promise.resolve(result).then(resolve),
  }
  return chain as any
})

vi.spyOn(Listing, 'countDocuments').mockImplementation(async (query: any = {}) => {
  let count = 0
  for (const l of listings.values()) {
    if (query.type && l.type !== query.type) continue
    if (query.category && l.category !== query.category) continue
    if (query.status && l.status !== query.status) continue
    count++
  }
  return count
})

vi.spyOn(Listing, 'deleteMany').mockImplementation(async () => {
  listings.clear()
  return {} as any
})

// Mock Claim Model
vi.spyOn(Claim, 'create').mockImplementation(async (input: any) => {
  const doc = createMockClaimDoc(input)
  claims.set(doc._id.toString(), doc)
  return doc as any
})

vi.spyOn(Claim, 'findById').mockImplementation((id: any) => {
  const c = claims.get(id?.toString())
  return Promise.resolve(c) as any
})

vi.spyOn(Claim, 'findOne').mockImplementation((query: any) => {
  const getListingIdStr = (item: any) => {
    if (!item) return ''
    if (typeof item === 'object') return (item._id || item.id || '').toString()
    return item.toString()
  }
  const getClaimantIdStr = (item: any) => {
    if (!item) return ''
    if (typeof item === 'object') return (item._id || item.id || '').toString()
    return item.toString()
  }

  let found = null
  for (const c of claims.values()) {
    const lMatch = getListingIdStr(c.listingId) === getListingIdStr(query.listingId)
    const cMatch = getClaimantIdStr(c.claimantId) === getClaimantIdStr(query.claimantId)
    const sMatch = !query.status || c.status === query.status
    if (lMatch && cMatch && sMatch) {
      found = c
      break
    }
  }
  return Promise.resolve(found) as any
})

vi.spyOn(Claim, 'find').mockImplementation((query: any = {}) => {
  const getListingIdStr = (item: any) => {
    if (!item) return ''
    if (typeof item === 'object') return (item._id || item.id || '').toString()
    return item.toString()
  }
  const getClaimantIdStr = (item: any) => {
    if (!item) return ''
    if (typeof item === 'object') return (item._id || item.id || '').toString()
    return item.toString()
  }

  let result = Array.from(claims.values())
  if (query.claimantId) {
    result = result.filter((c) => getClaimantIdStr(c.claimantId) === getClaimantIdStr(query.claimantId))
  }
  if (query.listingId) {
    result = result.filter((c) => getListingIdStr(c.listingId) === getListingIdStr(query.listingId))
  }
  if (query.status) {
    result = result.filter((c) => c.status === query.status)
  }

  const chain = {
    populate: () => chain,
    sort: () => chain,
    limit: () => chain,
    lean: () => Promise.resolve(result),
    then: (resolve: any) => Promise.resolve(result).then(resolve),
  }
  return chain as any
})

vi.spyOn(Claim, 'countDocuments').mockImplementation(async (query: any = {}) => {
  let count = 0
  for (const c of claims.values()) {
    if (query.status && c.status !== query.status) continue
    count++
  }
  return count
})

vi.spyOn(Claim, 'deleteMany').mockImplementation(async () => {
  claims.clear()
  return {} as any
})

// Reset in-memory databases before each test
beforeEach(() => {
  users.clear()
  listings.clear()
  claims.clear()
})
