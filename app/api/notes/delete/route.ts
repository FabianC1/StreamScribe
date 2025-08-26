import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import UserNotes from '@/models/UserNotes'

// Local auth options for getServerSession
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [],
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🔐 Notes Delete API - Starting DELETE request...')
    
    // Connect to database
    await connectDB()
    console.log('✅ Notes Delete API - Connected to database')
    
    // Get session
    const session = await getServerSession(authOptions)
    console.log('🔐 Notes Delete API - Session:', session)
    
    if (!session?.user?.email) {
      console.log('❌ Notes Delete API - No session or email found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ Notes Delete API - User email:', session.user.email)
    
    const body = await request.json()
    console.log('🗑️ Notes Delete API - Received body:', body)
    
    const {
      transcriptionId,
      noteId,
      sectionId,
      youtubeUrl,
      videoId
    } = body
    
    if (!transcriptionId || !noteId || !sectionId) {
      console.log('❌ Notes Delete API - Missing required fields')
      return NextResponse.json({ 
        error: 'Missing required fields: transcriptionId, noteId, sectionId' 
      }, { status: 400 })
    }
    
    // Find user by email
    const User = require('@/models/User').default
    console.log('🔍 Notes Delete API - Looking for user with email:', session.user.email)
    
    const user = await User.findOne({ email: session.user.email })
    console.log('🔍 Notes Delete API - User found:', user ? 'Yes' : 'No', user ? `(ID: ${user._id})` : '')
    
    if (!user) {
      console.log('❌ Notes Delete API - User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Find existing user notes (no transcription verification needed)
    console.log('🔍 Notes Delete API - Looking for UserNotes with userId:', user._id, 'and transcriptionId:', transcriptionId)
    
    const userNotes = await UserNotes.findOne({
      userId: user._id,
      transcriptionId: transcriptionId
    })
    
    if (!userNotes) {
      console.log('❌ Notes Delete API - UserNotes not found')
      return NextResponse.json({ 
        error: 'No notes found for this transcription' 
      }, { status: 404 })
    }
    
    console.log('✅ Notes Delete API - Found UserNotes document:', userNotes._id)
    
    // Remove the note from the appropriate section
    let noteRemoved = false
    let updateQuery: any = {}
    
    console.log('🔍 Notes Delete API - Attempting to delete note:', noteId, 'from section:', sectionId)
    
    if (sectionId === 'video') {
      updateQuery = { $pull: { videoNotes: { id: noteId } } }
      noteRemoved = userNotes.videoNotes.some((note: any) => note.id === noteId)
    } else if (sectionId.startsWith('sentence-')) {
      updateQuery = { $pull: { sentenceNotes: { id: noteId } } }
      noteRemoved = userNotes.sentenceNotes.some((note: any) => note.id === noteId)
    } else if (sectionId.startsWith('highlight-')) {
      updateQuery = { $pull: { highlightNotes: { id: noteId } } }
      noteRemoved = userNotes.highlightNotes.some((note: any) => note.id === noteId)
    } else if (sectionId.startsWith('chapter-')) {
      updateQuery = { $pull: { chapterNotes: { id: noteId } } }
      noteRemoved = userNotes.chapterNotes.some((note: any) => note.id === noteId)
    } else if (sectionId.startsWith('custom-')) {
      updateQuery = { $pull: { customAnnotations: { id: noteId } } }
      noteRemoved = userNotes.customAnnotations.some((note: any) => note.id === noteId)
    }
    
    if (!noteRemoved) {
      console.log('❌ Notes Delete API - Note not found in section:', sectionId)
      return NextResponse.json({ 
        error: 'Note not found in the specified section' 
      }, { status: 404 })
    }
    
    console.log('✅ Notes Delete API - Note found, proceeding with deletion')
    
    // Use MongoDB's $pull operator to remove the note
    const result = await UserNotes.updateOne(
      { _id: userNotes._id },
      updateQuery
    )
    
    if (result.modifiedCount === 0) {
      console.log('❌ Notes Delete API - Failed to delete note, modifiedCount was 0')
      return NextResponse.json({ 
        error: 'Failed to delete note' 
      }, { status: 500 })
    }
    
    console.log('✅ Notes Delete API - Note deleted successfully from database')
    
    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    })
    
  } catch (error) {
    console.error('❌ Notes Delete API - Error deleting note:', error)
    return NextResponse.json({ 
      error: 'Failed to delete note' 
    }, { status: 500 })
  }
}
