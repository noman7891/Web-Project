import mongoose from 'mongoose'
import { config } from '../config/env'
import { maskMongoUri } from '../config/db'
import { logger } from './logger'

export const verifyMongoConnection = async (): Promise<boolean> => {
  const rawUri = config.mongodbUri
  const safeUri = maskMongoUri(rawUri)

  console.log('\n========================================================')
  console.log(' CampusConnect — MongoDB Connectivity Diagnostic Tool ')
  console.log('========================================================')
  console.log(`Environment Target : ${config.nodeEnv}`)
  console.log(`Configured URI     : ${safeUri}`)

  if (!rawUri || rawUri.includes('localhost') || rawUri.includes('127.0.0.1')) {
    console.log('\n[DIAGNOSTIC NOTICE]')
    console.log('Your MONGODB_URI is currently pointing to a local instance.')
    console.log('If you are preparing for live cloud deployment with MongoDB Atlas:')
    console.log('1. Follow the steps in docs/atlas-setup-guide.md to create an Atlas cluster.')
    console.log('2. Set your MONGODB_URI in server/.env with your cluster credentials.')
    console.log('3. Re-run this verification tool: npm run verify-db\n')
  }

  try {
    console.log('[PROBING] Attempting connection to MongoDB cluster (timeout: 8s)...')
    const conn = await mongoose.connect(rawUri, {
      serverSelectionTimeoutMS: 8000,
    })

    console.log('[SUCCESS] TCP connection established!')
    console.log(`Cluster Host       : ${conn.connection.host}`)
    console.log(`Database Name      : ${conn.connection.name}`)

    // Test ping
    console.log('[PROBING] Executing ping command...')
    const adminDb = conn.connection.db?.admin()
    if (adminDb) {
      const pingResult = await adminDb.ping()
      console.log(`[SUCCESS] Admin ping response: ${JSON.stringify(pingResult)}`)
    }

    // Inspect collections
    const collections = await conn.connection.db?.listCollections().toArray()
    const colNames = collections?.map((c) => c.name) || []
    console.log(`Existing Collections (${colNames.length}): ${colNames.join(', ') || 'None (fresh database)'}`)

    console.log('\n--------------------------------------------------------')
    console.log(' VERDICT: MongoDB Atlas connection is FULLY OPERATIONAL ')
    console.log(' You are clear to proceed with database seeding & deploy! ')
    console.log('--------------------------------------------------------\n')

    await mongoose.disconnect()
    return true
  } catch (error: any) {
    console.error('\n[CONNECTION FAILURE]')
    console.error(`Error Code / Name : ${error.name || 'UnknownError'}`)
    console.error(`Failure Message   : ${error.message || String(error)}`)

    console.log('\n[TROUBLESHOOTING CHECKLIST]')
    if (error.message?.includes('bad auth') || error.message?.includes('Authentication failed')) {
      console.log('-> Issue: Bad username or password in MONGODB_URI.')
      console.log('   Fix  : Check Database Access in MongoDB Atlas. If your password has special')
      console.log('          characters (@, :, /, #), ensure they are URL-encoded.')
    } else if (
      error.message?.includes('ETIMEDOUT') ||
      error.message?.includes('Server selection timed out') ||
      error.name === 'MongooseServerSelectionError'
    ) {
      console.log('-> Issue: Network access blocked or cluster unreachable.')
      console.log('   Fix 1: Go to MongoDB Atlas > Network Access > Add IP Address > 0.0.0.0/0')
      console.log('   Fix 2: Check if your local internet or firewall blocks outbound port 27017.')
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('querySrv')) {
      console.log('-> Issue: DNS lookup failed for cluster hostname.')
      console.log('   Fix  : Check cluster URL spelling in your MONGODB_URI connection string.')
    } else {
      console.log('-> Fix: Refer to docs/atlas-setup-guide.md for detailed resolution steps.')
    }
    console.log('--------------------------------------------------------\n')
    return false
  }
}

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('verifyConnection.ts')) {
  verifyMongoConnection().then((ok) => {
    process.exit(ok ? 0 : 1)
  })
}

