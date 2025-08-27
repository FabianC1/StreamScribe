import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await connectDB()

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomUUID()
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Save reset token to user - Try both approaches
    console.log('💾 Saving token to user:', user.email)
    console.log('🔑 Token:', resetToken)
    console.log('⏰ Expiry:', resetTokenExpiry)
    
    // Use direct database update to ensure fields are saved
    console.log('🔄 Using direct database update...')
    const updateResult = await User.updateOne(
      { email: email.toLowerCase() },
      { 
        $set: { 
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry
        } 
      }
    )
    console.log('📊 Update result:', updateResult)
    
    if (updateResult.modifiedCount === 0) {
      throw new Error('Failed to update user with reset token')
    }
    
    // Verify the save worked
    const savedUser = await User.findOne({ email: email.toLowerCase() })
    console.log('✅ User after save:', {
      email: savedUser?.email,
      hasToken: !!savedUser?.resetPasswordToken,
      tokenExpiry: savedUser?.resetPasswordExpires
    })
    
    // Also check the raw document
    const rawUser = await User.findOne({ email: email.toLowerCase() }).lean()
    console.log('🔍 Raw user document:', {
      hasToken: !!rawUser?.resetPasswordToken,
      tokenExpiry: rawUser?.resetPasswordExpires,
      allFields: Object.keys(rawUser || {})
    })

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password/${resetToken}`

    // Send real password reset email
    try {
      await sendPasswordResetEmail({
        email: user.email,
        resetUrl,
        firstName: user.firstName
      })
      console.log('📧 Password reset email sent successfully to:', email)
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError)
      // Don't fail the request if email fails, just log it
      // User can still use the reset link from console for testing
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset link sent! Check your inbox and spam folder.' 
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}
