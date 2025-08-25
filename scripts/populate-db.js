const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Sample data arrays
const sampleUsers = [
  {
    email: 'john.doe@example.com',
    googleId: 'google_123456789',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    subscriptionTier: 'premium',
    subscriptionStatus: 'active',
    hoursUsed: 45,
    hoursLimit: 100,
    emailVerified: true,
    lastLoginAt: new Date()
  },
  {
    email: 'sarah.wilson@example.com',
    googleId: 'google_987654321',
    firstName: 'Sarah',
    lastName: 'Wilson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    subscriptionTier: 'standard',
    subscriptionStatus: 'active',
    hoursUsed: 28,
    hoursLimit: 50,
    emailVerified: true,
    lastLoginAt: new Date()
  },
  {
    email: 'mike.chen@example.com',
    googleId: 'google_456789123',
    firstName: 'Mike',
    lastName: 'Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    subscriptionTier: 'basic',
    subscriptionStatus: 'active',
    hoursUsed: 15,
    hoursLimit: 30,
    emailVerified: true,
    lastLoginAt: new Date()
  },
  {
    email: 'emma.rodriguez@example.com',
    googleId: 'google_789123456',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    subscriptionTier: 'premium',
    subscriptionStatus: 'active',
    hoursUsed: 67,
    hoursLimit: 100,
    emailVerified: true,
    lastLoginAt: new Date()
  },
  {
    email: 'david.kim@example.com',
    googleId: 'google_321654987',
    firstName: 'David',
    lastName: 'Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    subscriptionTier: 'standard',
    subscriptionStatus: 'active',
    hoursUsed: 32,
    hoursLimit: 50,
    emailVerified: true,
    lastLoginAt: new Date()
  }
]

const sampleVideoData = [
  {
    title: 'Introduction to Machine Learning Fundamentals',
    youtubeUrl: 'https://www.youtube.com/watch?v=KNAWp2S3w94',
    videoId: 'KNAWp2S3w94',
    duration: 45.5,
    languageCode: 'en'
  },
  {
    title: 'Web Development Best Practices 2024',
    youtubeUrl: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
    videoId: '8aGhZQkoFbQ',
    duration: 32.2,
    languageCode: 'en'
  },
  {
    title: 'Data Science Interview Preparation',
    youtubeUrl: 'https://www.youtube.com/watch?v=ua-CiDNNj30',
    videoId: 'ua-CiDNNj30',
    duration: 58.7,
    languageCode: 'en'
  },
  {
    title: 'React Hooks Complete Guide',
    youtubeUrl: 'https://www.youtube.com/watch?v=dpw9EHDh2bM',
    videoId: 'dpw9EHDh2bM',
    duration: 41.3,
    languageCode: 'en'
  },
  {
    title: 'Python for Beginners: Full Course',
    youtubeUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    videoId: '_uQrJ0TkZlc',
    duration: 67.8,
    languageCode: 'en'
  },
  {
    title: 'JavaScript ES6+ Features Explained',
    youtubeUrl: 'https://www.youtube.com/watch?v=NCwa_xi0Uuc',
    videoId: 'NCwa_xi0Uuc',
    duration: 38.9,
    languageCode: 'en'
  },
  {
    title: 'Database Design Principles',
    youtubeUrl: 'https://www.youtube.com/watch?v=ztHopE5Wnpc',
    videoId: 'ztHopE5Wnpc',
    duration: 52.4,
    languageCode: 'en'
  },
  {
    title: 'DevOps Fundamentals for Developers',
    youtubeUrl: 'https://www.youtube.com/watch?v=9UQm8HcZvdc',
    videoId: '9UQm8HcZvdc',
    duration: 44.1,
    languageCode: 'en'
  }
]

// Generate realistic transcript text
function generateTranscript(videoTitle, duration) {
  const topics = videoTitle.toLowerCase().split(' ')
  const sentences = [
    `Welcome to this comprehensive guide on ${topics.slice(2).join(' ')}.`,
    `Today we'll be covering the fundamental concepts that every developer should know.`,
    `Let's start with the basics and work our way up to more advanced topics.`,
    `Understanding these principles will help you build better applications.`,
    `Let me show you some practical examples that demonstrate these concepts.`,
    `As you can see, this approach provides several benefits over traditional methods.`,
    `It's important to remember that good practices lead to maintainable code.`,
    `Let's take a look at some common pitfalls and how to avoid them.`,
    `This technique has been widely adopted in the industry for good reasons.`,
    `I hope this overview has given you a solid foundation to build upon.`,
    `Remember to practice these concepts in your own projects.`,
    `Feel free to ask questions in the comments below.`,
    `Thanks for watching, and happy coding!`
  ]
  
  return sentences.join(' ')
}

// Generate realistic highlights
function generateHighlights(videoTitle) {
  const highlights = [
    `Key concepts in ${videoTitle.split(' ').slice(-2).join(' ')}`,
    `Best practices for implementation`,
    `Common mistakes to avoid`,
    `Performance optimization tips`,
    `Real-world applications`,
    `Industry standards and trends`,
    `Tools and frameworks overview`,
    `Debugging and troubleshooting`,
    `Security considerations`,
    `Scalability and maintenance`
  ]
  
  return highlights
}

// Generate realistic words array with timestamps
function generateWords(duration) {
  const words = []
  const totalWords = Math.floor(duration * 2.5) // Average speaking rate
  const timeStep = duration / totalWords
  
  for (let i = 0; i < totalWords; i++) {
    const time = i * timeStep
    words.push({
      text: `word${i + 1}`,
      start: time * 1000,
      end: (time + timeStep) * 1000,
      confidence: 0.85 + Math.random() * 0.15
    })
  }
  
  return words
}

async function populateDatabase() {
  try {
    console.log('🚀 Starting database population...')
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'streamscribe'
    })
    console.log('✅ Connected to MongoDB')
    
    // Get the database instance
    const db = mongoose.connection.db
    
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await db.collection('users').deleteMany({})
    await db.collection('transcriptions').deleteMany({})
    await db.collection('usernotes').deleteMany({})
    await db.collection('exporthistories').deleteMany({})
    await db.collection('subscriptions').deleteMany({})
    await db.collection('usagetrackings').deleteMany({})
    console.log('✅ Existing data cleared')
    
    // Create users
    console.log('👥 Creating users...')
    const createdUsers = []
    for (const userData of sampleUsers) {
      const user = await db.collection('users').insertOne({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      createdUsers.push({ _id: user.insertedId, ...userData })
      console.log(`✅ Created user: ${userData.email}`)
    }
    
    // Create transcriptions for each user
    console.log('📝 Creating transcriptions...')
    const createdTranscriptions = []
    
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i]
      const userTranscriptions = Math.floor(Math.random() * 4) + 2 // 2-5 transcriptions per user
      
      for (let j = 0; j < userTranscriptions; j++) {
        const videoData = sampleVideoData[Math.floor(Math.random() * sampleVideoData.length)]
        const transcript = generateTranscript(videoData.title, videoData.duration)
        const highlights = generateHighlights(videoData.title)
        const words = generateWords(videoData.duration)
        
        const transcription = await db.collection('transcriptions').insertOne({
          userId: user._id,
          youtubeUrl: videoData.youtubeUrl,
          videoTitle: videoData.title,
          videoId: videoData.videoId,
          transcript,
          confidence: 0.92 + Math.random() * 0.08,
          audioDuration: videoData.duration,
          languageCode: videoData.languageCode,
          words,
          highlights,
          sentiment: 'positive',
          chapters: [
            { title: 'Introduction', start: 0, end: videoData.duration * 0.2 },
            { title: 'Main Content', start: videoData.duration * 0.2, end: videoData.duration * 0.8 },
            { title: 'Conclusion', start: videoData.duration * 0.8, end: videoData.duration }
          ],
          entities: [
            { text: 'JavaScript', type: 'TECHNOLOGY', confidence: 0.95 },
            { text: 'React', type: 'TECHNOLOGY', confidence: 0.92 },
            { text: 'Web Development', type: 'DOMAIN', confidence: 0.89 }
          ],
          speakerLabels: [],
          isCached: true,
          cachedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        createdTranscriptions.push({ _id: transcription.insertedId, ...videoData, userId: user._id })
        console.log(`✅ Created transcription: ${videoData.title} for ${user.email}`)
      }
    }
    
    // Create user notes
    console.log('📝 Creating user notes...')
    for (const transcription of createdTranscriptions) {
              const noteCount = Math.floor(Math.random() * 3) + 1 // 1-3 notes per transcription
        
        for (let i = 0; i < noteCount; i++) {
          await db.collection('usernotes').insertOne({
            userId: transcription.userId,
            transcriptionId: transcription._id,
            sectionId: `section_${i}`,
            text: `Important note about ${transcription.title.split(' ').slice(0, 3).join(' ')}`,
            timestamp: transcription.duration * Math.random(),
            createdAt: new Date(),
            updatedAt: new Date()
          })
          
          console.log(`✅ Created note for transcription: ${transcription.title}`)
        }
    }
    
    // Create export history
    console.log('📤 Creating export history...')
    const exportFormats = ['TXT', 'DOCX', 'SRT', 'VTT', 'MP3', 'MP4']
    
    for (const transcription of createdTranscriptions) {
      const exportCount = Math.floor(Math.random() * 3) + 1 // 1-3 exports per transcription
      
      for (let i = 0; i < exportCount; i++) {
        const format = exportFormats[Math.floor(Math.random() * exportFormats.length)]
        await db.collection('exporthistories').insertOne({
          userId: transcription.userId,
          transcriptionId: transcription._id,
          format,
          filename: `${transcription.title.replace(/[^a-zA-Z0-9]/g, '_')}_${format.toLowerCase()}`,
          fileSize: Math.floor(Math.random() * 1000000) + 100000, // 100KB - 1MB
          downloadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          success: Math.random() > 0.1, // 90% success rate
          errorMessage: Math.random() > 0.9 ? 'Export failed due to server error' : null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        console.log(`✅ Created export history: ${format} for ${transcription.title}`)
      }
    }
    
    // Create subscriptions
    console.log('💳 Creating subscriptions...')
    for (const user of createdUsers) {
      await db.collection('subscriptions').insertOne({
        userId: user._id,
        stripeSubscriptionId: `sub_${Math.random().toString(36).substr(2, 9)}`,
        tier: user.subscriptionTier,
        status: user.subscriptionStatus,
        currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        cancelAtPeriodEnd: false,
        priceId: `price_${user.subscriptionTier}`,
        amount: user.subscriptionTier === 'premium' ? 2999 : user.subscriptionTier === 'standard' ? 1999 : 999,
        currency: 'usd',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      console.log(`✅ Created subscription for ${user.email}: ${user.subscriptionTier}`)
    }
    
    // Create usage tracking
    console.log('📊 Creating usage tracking...')
    for (const user of createdUsers) {
      // Create usage for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        const dailyUsage = Math.floor(Math.random() * 3) + 1 // 1-3 hours per day
        await db.collection('usagetrackings').insertOne({
          userId: user._id,
          date,
          hoursUsed: dailyUsage,
          transcriptionsCount: Math.floor(Math.random() * 2) + 1,
          exportsCount: Math.floor(Math.random() * 3) + 1,
          tier: user.subscriptionTier,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
      console.log(`✅ Created usage tracking for ${user.email}`)
    }
    
    console.log('\n🎉 Database population completed successfully!')
    console.log(`📊 Created ${createdUsers.length} users`)
    console.log(`📝 Created ${createdTranscriptions.length} transcriptions`)
    console.log(`💳 Created ${createdUsers.length} subscriptions`)
    console.log(`📊 Created usage tracking for all users`)
    
    // Display some statistics
    const totalUsers = await db.collection('users').countDocuments()
    const totalTranscriptions = await db.collection('transcriptions').countDocuments()
    const totalNotes = await db.collection('usernotes').countDocuments()
    const totalExports = await db.collection('exporthistories').countDocuments()
    
    console.log('\n📈 Final Statistics:')
    console.log(`Users: ${totalUsers}`)
    console.log(`Transcriptions: ${totalTranscriptions}`)
    console.log(`Notes: ${totalNotes}`)
    console.log(`Exports: ${totalExports}`)
    
  } catch (error) {
    console.error('❌ Error populating database:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Run the script
populateDatabase()
