import mongoose from 'mongoose'
import { User } from '../models/User'
import { Listing } from '../models/Listing'
import { Claim } from '../models/Claim'
import { connectDB, disconnectDB } from '../config/db'
import { logger } from './logger'

export const seedDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED_IN_PRODUCTION !== 'true') {
      logger.error(
        'CRITICAL ABORT: Seeding wipes collections! To seed a fresh production database, set ALLOW_SEED_IN_PRODUCTION=true in your environment.'
      )
      process.exit(1)
    }

    logger.info('Starting database seeding...')
    await connectDB()

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      Claim.deleteMany({}),
    ])
    logger.info('Cleared existing collections.')

    // 1. Create Users
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@campusconnect.dbs.ie'
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPass2026!'

    const adminUser = await User.create({
      name: 'DBS Security Office',
      email: adminEmail,
      passwordHash: adminPassword,
      role: 'admin',
    })

    const studentCiaran = await User.create({
      name: 'Ciaran O’Connor',
      email: 'ciaran@student.dbs.ie',
      passwordHash: 'StudentPass2026!',
      role: 'student',
    })

    const studentAisling = await User.create({
      name: 'Aisling Kelly',
      email: 'aisling@student.dbs.ie',
      passwordHash: 'StudentPass2026!',
      role: 'student',
    })

    logger.info(`Created 1 Admin (${adminEmail}) and 2 Student users.`)

    // 2. Create Listings
    const listingAirPods = await Listing.create({
      title: 'Apple AirPods Pro (2nd Gen) with MagSafe Case',
      description: 'Found on desk 402 in Castle House Library. White case with small scuff on the hinge. Left earbud has small blue tip indicator.',
      type: 'found',
      category: 'Electronics',
      location: 'Castle House Library, 4th Floor Study Desk 402',
      itemDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      userId: adminUser._id,
      contactInfo: 'security@dbs.ie / (01) 417-7500',
    })

    const listingLeapCard = await Listing.create({
      title: 'Student Leap Card (TFI Dublin Bus)',
      description: 'Found on table near Aungier Street canteen entrance. Card number ending in 8492 with student profile photo.',
      type: 'found',
      category: 'Cards & ID',
      location: 'Aungier Street Campus Canteen',
      itemDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=600&q=80',
      status: 'claimed',
      userId: adminUser._id,
      contactInfo: 'reception@dbs.ie',
    })

    const listingKeys = await Listing.create({
      title: 'Set of 3 Yale Keys on Navy DBS Lanyard',
      description: 'Misplaced my house keys attached to a navy blue Dublin Business School lanyard with a small brass bottle opener.',
      type: 'lost',
      category: 'Keys',
      location: 'Balfe Street entrance or Lecture Room 2.3',
      itemDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      userId: studentCiaran._id,
      contactInfo: 'ciaran@student.dbs.ie',
    })

    const listingCharger = await Listing.create({
      title: 'Dell 65W USB-C Laptop Charger',
      description: 'Black oval Dell USB-C fast charger left plugged into the wall outlet next to workstation 14.',
      type: 'found',
      category: 'Electronics',
      location: 'Computer Lab 3.1, Castle House',
      itemDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      userId: studentCiaran._id,
      contactInfo: 'ciaran@student.dbs.ie',
    })

    const listingBackpack = await Listing.create({
      title: 'The North Face Borealis Black Backpack',
      description: 'Left on the sofas in the 2nd floor student common room. Contains B9IS130 lecture notes, a silver water bottle, and a pencil case.',
      type: 'lost',
      category: 'Bags',
      location: 'Student Common Room, 2nd Floor',
      itemDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      userId: studentAisling._id,
      contactInfo: 'aisling@student.dbs.ie',
    })

    const listingTextbook = await Listing.create({
      title: 'Full-Stack React & Node Web Architecture Textbook',
      description: 'Hardcover textbook left on study carrel 12. Has highlighted yellow sections on chapters 4 and 6.',
      type: 'found',
      category: 'Books & Study',
      location: 'Main Library, 2nd Floor',
      itemDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      userId: adminUser._id,
      contactInfo: 'library@dbs.ie',
    })

    logger.info('Created 6 Campus Listings (Lost & Found).')

    // 3. Create Claims
    // Pending claim
    await Claim.create({
      listingId: listingAirPods._id,
      claimantId: studentAisling._id,
      explanation: 'These AirPods belong to me! The Bluetooth device name shows as "Aisling’s AirPods" and I can demonstrate matching serial numbers on my Apple ID iCloud settings.',
      status: 'pending',
    })

    // Approved claim
    await Claim.create({
      listingId: listingLeapCard._id,
      claimantId: studentCiaran._id,
      explanation: 'This is my student Leap card. Student ID is 10582910 matching the card photo.',
      status: 'approved',
      adminNote: 'Student identity verified against college database. Card returned at security reception.',
      reviewedBy: adminUser._id,
    })

    logger.info('Created sample claims (1 pending, 1 approved).')
    logger.info('Database seeded successfully!')

    await disconnectDB()
    process.exit(0)
  } catch (error) {
    logger.error('Error during database seeding:', error)
    process.exit(1)
  }
}

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase()
}

