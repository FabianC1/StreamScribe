const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Import models
const User = require('../models/User')
const Transcription = require('../models/Transcription')
const UsageTracking = require('../models/UsageTracking')
const Subscription = require('../models/Subscription')

const MONGODB_URI = process.env.MONGODB_URI

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Transcription.deleteMany({})
    await UsageTracking.deleteMany({})
    await Subscription.deleteMany({})
    console.log('🗑️ Cleared existing data')

    // Create test user
    const testUser = new User({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'hashedpassword123', // In real app, this would be bcrypt hashed
      subscriptionTier: 'basic',
      isActive: true
    })
    await testUser.save()
    console.log('👤 Created test user:', testUser.email)

    // Create admin user (galaselfabian@gmail.com gets premium for free)
    const adminUser = new User({
      email: 'galaselfabian@gmail.com',
      firstName: 'Fabian',
      lastName: 'Galasel',
      password: 'hashedpassword123',
      subscriptionTier: 'premium',
      isActive: true
    })
    await adminUser.save()
    console.log('👑 Created admin user:', adminUser.email)

    // Create sample transcriptions for test user
    const sampleTranscriptions = [
      {
        userId: testUser._id,
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoTitle: 'Sample Video 1 - Introduction to AI',
        videoId: 'dQw4w9WgXcQ',
        transcript: 'This is a sample transcription for testing purposes. It contains some text about artificial intelligence and machine learning.',
        confidence: 0.95,
        audioDuration: 1800, // 30 minutes
        languageCode: 'en',
        words: [],
        highlights: [],
        sentiment: [],
        chapters: [],
        entities: [],
        speakerLabels: [],
        isCached: false,
        cachedAt: new Date()
      },
      {
        userId: testUser._id,
        youtubeUrl: 'https://www.youtube.com/watch?v=example2',
        videoTitle: 'Sample Video 2 - Machine Learning Basics',
        videoId: 'example2',
        transcript: 'Another sample transcription about machine learning fundamentals and neural networks.',
        confidence: 0.92,
        audioDuration: 1200, // 20 minutes
        languageCode: 'en',
        words: [],
        highlights: [],
        sentiment: [],
        chapters: [],
        entities: [],
        speakerLabels: [],
        isCached: false,
        cachedAt: new Date()
      }
    ]

    for (const transcription of sampleTranscriptions) {
      const newTranscription = new Transcription(transcription)
      await newTranscription.save()
    }
    console.log('📝 Created sample transcriptions')

    // Create usage tracking for test user
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const usageTracking = new UsageTracking({
      userId: testUser._id,
      date: today,
      hoursUsed: 0.83, // 50 minutes total
      transcriptionsCount: 2,
      exportsCount: 0,
      tier: 'basic'
    })
    await usageTracking.save()
    console.log('📊 Created usage tracking')

    // Create subscriptions
    const basicSubscription = new Subscription({
      userId: testUser._id,
      tier: 'basic',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      monthlyPrice: 9.99,
      currency: 'USD'
    })
    await basicSubscription.save()

    const premiumSubscription = new Subscription({
      userId: adminUser._id,
      tier: 'premium',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      monthlyPrice: 29.99,
      currency: 'USD'
    })
    await premiumSubscription.save()
    console.log('💳 Created subscriptions')

    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📋 Summary:')
    console.log('- Users: 2 (1 test, 1 admin)')
    console.log('- Transcriptions: 2')
    console.log('- Usage tracking: 1 record')
    console.log('- Subscriptions: 2')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Run the seeding
seedDatabase()
