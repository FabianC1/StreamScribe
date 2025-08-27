import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    await connectDB()

    console.log('🔍 Verifying token:', token)

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() } // Token not expired
    })

    console.log('👤 User found:', user ? user.email : 'None')
    console.log('⏰ Current time:', new Date())
    console.log('🔑 Token expiry:', user?.resetPasswordExpires)

    if (!user) {
      // Check if user exists but token is expired
      const expiredUser = await User.findOne({ resetPasswordToken: token })
      if (expiredUser) {
        console.log('⚠️ Token expired for user:', expiredUser.email)
        return NextResponse.json({ error: 'Reset token has expired. Please request a new one.' }, { status: 400 })
      }
      
      console.log('❌ No user found with token:', token)
      return NextResponse.json({ error: 'Invalid reset token' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Token is valid' 
    })

  } catch (error) {
    console.error('Verify reset token error:', error)
    return NextResponse.json(
      { error: 'Failed to verify reset token' },
      { status: 500 }
    )
  }
}
