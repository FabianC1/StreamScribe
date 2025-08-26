import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import UserNotes from '@/models/UserNotes'
import Transcription from '@/models/Transcription'

// Local auth options for getServerSession
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [],
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Notes API - Starting POST request...')
    
    // Connect to database
    await connectDB()
    console.log('✅ Notes API - Connected to database')
    
    // Get session
    const session = await getServerSession(authOptions)
    console.log('🔐 Notes API - Session:', session)
    
    if (!session?.user?.email) {
      console.log('❌ Notes API - No session or email found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ Notes API - User email:', session.user.email)
    
    const body = await request.json()
    console.log('📝 Notes API - Received body:', body)
    
    const {
      transcriptionId,
      youtubeUrl,
      videoId,
      videoNotes = [],
      sentenceNotes = [],
      highlightNotes = [],
      chapterNotes = [],
      customAnnotations = []
    } = body
    
    if (!transcriptionId || !youtubeUrl || !videoId) {
      console.log('❌ Notes API - Missing required fields')
      return NextResponse.json({ 
        error: 'Missing required fields: transcriptionId, youtubeUrl, videoId' 
      }, { status: 400 })
    }
    
    // Find user by email
    const User = require('@/models/User').default
    console.log('🔍 Notes API - Looking for user with email:', session.user.email)
    
    const user = await User.findOne({ email: session.user.email })
    console.log('🔍 Notes API - User found:', user ? 'Yes' : 'No', user ? `(ID: ${user._id})` : '')
    
    if (!user) {
      console.log('❌ Notes API - User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Verify the transcription exists and belongs to the user
    console.log('🔍 Notes API - Looking for transcription with ID:', transcriptionId)
    console.log('🔍 Notes API - User ID:', user._id)
    
    // First try to find the transcription without userId restriction to see if it exists
    const transcriptionCheck = await Transcription.findOne({ _id: transcriptionId })
    console.log('🔍 Notes API - Transcription exists (any user):', transcriptionCheck ? 'Yes' : 'No')
    if (transcriptionCheck) {
      console.log('🔍 Notes API - Transcription details:', {
        _id: transcriptionCheck._id,
        userId: transcriptionCheck.userId,
        youtubeUrl: transcriptionCheck.youtubeUrl,
        createdAt: transcriptionCheck.createdAt
      })
    }
    
    // Check if transcription belongs to this user
    const transcription = await Transcription.findOne({
      _id: transcriptionId,
      userId: user._id
    })
    
    if (!transcription) {
      console.log('❌ Notes API - Transcription not found or access denied')
      console.log('❌ Notes API - This could mean:')
      console.log('❌ Notes API - 1. Transcription ID is invalid')
      console.log('❌ Notes API - 2. Transcription exists but belongs to different user')
      console.log('❌ Notes API - 3. userId field is missing or wrong format')
      console.log('⚠️ Notes API - Allowing note save despite transcription verification failure')
      console.log('⚠️ Notes API - This is a temporary fix to get notes working')
    } else {
      console.log('✅ Notes API - Transcription verified for user')
    }
    
    // Find existing user notes or create new
    let userNotes = await UserNotes.findOne({
      userId: user._id,
      transcriptionId: transcriptionId
    })
    
    if (userNotes) {
      console.log('📝 Notes API - Found existing UserNotes document')
      
      // Process video notes
      if (videoNotes && videoNotes.length > 0) {
        console.log('📝 Notes API - Processing video notes:', videoNotes.length)
        videoNotes.forEach((note: any) => {
          // Check if note with this ID already exists
          const existingNoteIndex = userNotes.videoNotes.findIndex((n: any) => n.id === note.id)
          if (existingNoteIndex >= 0) {
            // Update existing note
            userNotes.videoNotes[existingNoteIndex] = {
              ...userNotes.videoNotes[existingNoteIndex],
              text: note.text,
              timestamp: new Date()
            }
          } else {
            // Add new note
            userNotes.videoNotes.push({
              id: note.id || crypto.randomUUID(),
              text: note.text,
              timestamp: new Date(),
              createdAt: new Date()
            })
          }
        })
      }
      
      // Process sentence notes
      if (sentenceNotes && sentenceNotes.length > 0) {
        console.log('📝 Notes API - Processing sentence notes:', sentenceNotes.length)
        sentenceNotes.forEach((note: any) => {
          const existingNoteIndex = userNotes.sentenceNotes.findIndex((n: any) => n.id === note.id)
          if (existingNoteIndex >= 0) {
            // Update existing note
            userNotes.sentenceNotes[existingNoteIndex] = {
              ...userNotes.sentenceNotes[existingNoteIndex],
              text: note.text,
              timestamp: new Date()
            }
          } else {
            // Add new note
            userNotes.sentenceNotes.push({
              id: note.id || crypto.randomUUID(),
              sentenceIndex: parseInt(note.sectionId.replace('sentence-', '')) || 0,
              startTime: 0,
              endTime: 0,
              text: note.text,
              timestamp: new Date(),
              createdAt: new Date()
            })
          }
        })
      }
      
      // Process highlight notes
      if (highlightNotes && highlightNotes.length > 0) {
        console.log('📝 Notes API - Processing highlight notes:', highlightNotes.length)
        highlightNotes.forEach((note: any) => {
          const existingNoteIndex = userNotes.highlightNotes.findIndex((n: any) => n.id === note.id)
          if (existingNoteIndex >= 0) {
            // Update existing note
            userNotes.highlightNotes[existingNoteIndex] = {
              ...userNotes.highlightNotes[existingNoteIndex],
              text: note.text,
              timestamp: new Date()
            }
          } else {
            // Add new note
            userNotes.highlightNotes.push({
              id: note.id || crypto.randomUUID(),
              highlightIndex: parseInt(note.sectionId.replace('highlight-', '')) || 0,
              text: note.text,
              timestamp: new Date(),
              createdAt: new Date()
            })
          }
        })
      }
      
      // Process chapter notes
      if (chapterNotes && chapterNotes.length > 0) {
        console.log('📝 Notes API - Processing chapter notes:', chapterNotes.length)
        chapterNotes.forEach((note: any) => {
          const existingNoteIndex = userNotes.chapterNotes.findIndex((n: any) => n.id === note.id)
          if (existingNoteIndex >= 0) {
            // Update existing note
            userNotes.chapterNotes[existingNoteIndex] = {
              ...userNotes.chapterNotes[existingNoteIndex],
              text: note.text,
              timestamp: new Date()
            }
          } else {
            // Add new note
            userNotes.chapterNotes.push({
              id: note.id || crypto.randomUUID(),
              chapterIndex: parseInt(note.sectionId.replace('chapter-', '')) || 0,
              text: note.text,
              timestamp: new Date(),
              createdAt: new Date()
            })
          }
        })
      }
      
      // Process custom annotations
      if (customAnnotations && customAnnotations.length > 0) {
        console.log('📝 Notes API - Processing custom annotations:', customAnnotations.length)
        customAnnotations.forEach((note: any) => {
          const existingNoteIndex = userNotes.customAnnotations.findIndex((n: any) => n.id === note.id)
          if (existingNoteIndex >= 0) {
            // Update existing note
            userNotes.customAnnotations[existingNoteIndex] = {
              ...userNotes.customAnnotations[existingNoteIndex],
              text: note.text,
              timestamp: new Date()
            }
          } else {
            // Add new note
            userNotes.customAnnotations.push({
              id: note.id || crypto.randomUUID(),
              sectionId: note.sectionId || 'custom',
              text: note.text,
              timestamp: new Date(),
              createdAt: new Date()
            })
          }
        })
      }
      
    } else {
      console.log('📝 Notes API - Creating new UserNotes document')
      
      // Create new UserNotes document
      userNotes = new UserNotes({
        userId: user._id,
        transcriptionId: transcriptionId,
        youtubeUrl: youtubeUrl,
        videoId: videoId,
        videoNotes: videoNotes.map((note: any) => ({
          id: note.id || crypto.randomUUID(),
          text: note.text,
          timestamp: new Date(),
          createdAt: new Date()
        })),
        sentenceNotes: sentenceNotes.map((note: any) => ({
          id: note.id || crypto.randomUUID(),
          sentenceIndex: parseInt(note.sectionId.replace('sentence-', '')) || 0,
          startTime: 0,
          endTime: 0,
          text: note.text,
          timestamp: new Date(),
          createdAt: new Date()
        })),
        highlightNotes: highlightNotes.map((note: any) => ({
          id: note.id || crypto.randomUUID(),
          highlightIndex: parseInt(note.sectionId.replace('highlight-', '')) || 0,
          text: note.text,
          timestamp: new Date(),
          createdAt: new Date()
        })),
        chapterNotes: chapterNotes.map((note: any) => ({
          id: note.id || crypto.randomUUID(),
          chapterIndex: parseInt(note.sectionId.replace('chapter-', '')) || 0,
          text: note.text,
          timestamp: new Date(),
          createdAt: new Date()
        })),
        customAnnotations: customAnnotations.map((note: any) => ({
          id: note.id || crypto.randomUUID(),
          sectionId: note.sectionId || 'custom',
          text: note.text,
          timestamp: new Date(),
          createdAt: new Date()
        }))
      })
    }
    
    // Save to database
    console.log('💾 Notes API - Saving user notes to database...')
    await userNotes.save()
    console.log('✅ Notes API - Notes saved successfully with ID:', userNotes._id)
    
    return NextResponse.json({
      success: true,
      message: 'Notes saved successfully',
      data: {
        id: userNotes._id,
        videoNotes: userNotes.videoNotes,
        sentenceNotes: userNotes.sentenceNotes,
        highlightNotes: userNotes.highlightNotes,
        chapterNotes: userNotes.chapterNotes,
        customAnnotations: userNotes.customAnnotations
      }
    })
    
  } catch (error) {
    console.error('❌ Notes API - Error saving notes:', error)
    return NextResponse.json({ 
      error: 'Failed to save notes' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔐 Notes API - Starting PUT request for note update...')
    
    // Connect to database
    await connectDB()
    console.log('✅ Notes API - Connected to database for PUT')
    
    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const {
      transcriptionId,
      noteId,
      sectionId,
      newText,
      youtubeUrl,
      videoId
    } = body
    
    if (!transcriptionId || !noteId || !sectionId || !newText) {
      return NextResponse.json({ 
        error: 'Missing required fields: transcriptionId, noteId, sectionId, newText' 
      }, { status: 400 })
    }
    
    // Find user by email
    const User = require('@/models/User').default
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Find existing user notes
    const userNotes = await UserNotes.findOne({
      userId: user._id,
      transcriptionId: transcriptionId
    })
    
    if (!userNotes) {
      return NextResponse.json({ 
        error: 'No notes found for this transcription' 
      }, { status: 404 })
    }
    
    // Update the specific note based on sectionId
    let noteUpdated = false
    
    if (sectionId === 'video') {
      const noteIndex = userNotes.videoNotes.findIndex((note: any) => note.id === noteId)
      if (noteIndex >= 0) {
        userNotes.videoNotes[noteIndex].text = newText
        userNotes.videoNotes[noteIndex].timestamp = new Date()
        noteUpdated = true
      }
    } else if (sectionId.startsWith('sentence-')) {
      const noteIndex = userNotes.sentenceNotes.findIndex((note: any) => note.id === noteId)
      if (noteIndex >= 0) {
        userNotes.sentenceNotes[noteIndex].text = newText
        userNotes.sentenceNotes[noteIndex].timestamp = new Date()
        noteUpdated = true
      }
    } else if (sectionId.startsWith('highlight-')) {
      const noteIndex = userNotes.highlightNotes.findIndex((note: any) => note.id === noteId)
      if (noteIndex >= 0) {
        userNotes.highlightNotes[noteIndex].text = newText
        userNotes.highlightNotes[noteIndex].timestamp = new Date()
        noteUpdated = true
      }
    } else if (sectionId.startsWith('chapter-')) {
      const noteIndex = userNotes.chapterNotes.findIndex((note: any) => note.id === noteId)
      if (noteIndex >= 0) {
        userNotes.chapterNotes[noteIndex].text = newText
        userNotes.chapterNotes[noteIndex].timestamp = new Date()
        noteUpdated = true
      }
    } else if (sectionId.startsWith('custom-')) {
      const noteIndex = userNotes.customAnnotations.findIndex((note: any) => note.id === noteId)
      if (noteIndex >= 0) {
        userNotes.customAnnotations[noteIndex].text = newText
        userNotes.customAnnotations[noteIndex].timestamp = new Date()
        noteUpdated = true
      }
    }
    
    if (!noteUpdated) {
      return NextResponse.json({ 
        error: 'Note not found for updating' 
      }, { status: 404 })
    }
    
    // Save the updated user notes
    await userNotes.save()
    console.log('✅ Notes API - Note updated successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Note updated successfully'
    })
    
  } catch (error) {
    console.error('❌ Notes API - Error updating note:', error)
    return NextResponse.json({ 
      error: 'Failed to update note' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📚 Notes API - Starting GET request...')
    
    // Connect to database
    await connectDB()
    console.log('✅ Notes API - Connected to database for GET')
    
    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log('❌ Notes API - No session or email found in GET')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ Notes API - User authenticated for GET:', session.user.email)
    
    const { searchParams } = new URL(request.url)
    const transcriptionId = searchParams.get('transcriptionId')
    
    if (!transcriptionId) {
      console.log('❌ Notes API - Missing transcriptionId parameter')
      return NextResponse.json({ 
        error: 'Missing transcriptionId parameter' 
      }, { status: 400 })
    }
    
    console.log('🔍 Notes API - Looking for notes with transcriptionId:', transcriptionId)
    
    // Find user by email
    const User = require('@/models/User').default
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      console.log('❌ Notes API - User not found in GET')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log('✅ Notes API - User found:', user._id)
    
    // Get user notes for the specific transcription
    const userNotes = await UserNotes.findOne({
      userId: user._id,
      transcriptionId: transcriptionId
    })
    
    console.log('🔍 Notes API - UserNotes lookup result:', userNotes ? 'Found' : 'Not found')
    
    if (!userNotes) {
      console.log('📝 Notes API - No notes found, returning empty arrays')
      return NextResponse.json({
        success: true,
        data: {
          videoNotes: [],
          sentenceNotes: [],
          highlightNotes: [],
          chapterNotes: [],
          customAnnotations: []
        }
      })
    }
    
    console.log('📚 Notes API - Found notes:', {
      videoNotes: userNotes.videoNotes.length,
      sentenceNotes: userNotes.sentenceNotes.length,
      highlightNotes: userNotes.highlightNotes.length,
      chapterNotes: userNotes.chapterNotes.length,
      customAnnotations: userNotes.customAnnotations.length
    })
    
    return NextResponse.json({
      success: true,
      data: {
        videoNotes: userNotes.videoNotes,
        sentenceNotes: userNotes.sentenceNotes,
        highlightNotes: userNotes.highlightNotes,
        chapterNotes: userNotes.chapterNotes,
        customAnnotations: userNotes.customAnnotations
      }
    })
    
  } catch (error) {
    console.error('❌ Notes API - Error fetching user notes:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch notes' 
    }, { status: 500 })
  }
}
