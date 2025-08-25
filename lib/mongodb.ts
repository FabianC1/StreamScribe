import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB || 'streamscribe'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

/**
 * Simple MongoDB connection utility
 */
async function connectDB(): Promise<typeof mongoose> {
  try {
    // Check if we're already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB')
      return mongoose
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
      bufferCommands: false,
    })

    console.log('✅ Connected to MongoDB successfully!')
    return conn
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

export default connectDB
